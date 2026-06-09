import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import axios from 'axios';
import rekkoLogo from '@/assets/rekko_logo.png';
import Seo from '@/components/seo/Seo';
import { pageJsonLd } from '@/components/seo/jsonLd';
import { seoPages } from '@/components/seo/pages';
import AnimeGuessInput from '@/components/animedle/AnimeGuessInput';
import AnimeChallengeView from '@/components/animedle/AnimeChallengeView';
import CharacterChallengeView from '@/components/animedle/CharacterChallengeView';
import OpeningChallengeView from '@/components/animedle/OpeningChallengeView';
import EmojiChallengeView from '@/components/animedle/EmojiChallengeView';
import ChallengeTabBar from '@/components/animedle/ChallengeTabBar';
import ConfettiEffect from '@/components/animedle/ConfettiEffect';

const BASE = import.meta.env.VITE_API_BASE_URL as string;
const MAX_WRONG_GUESSES = 4;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ChallengeType = 'anime' | 'character' | 'opening' | 'emoji';

interface AnimeInfo {
  malId: number;
  name: string;
  imgMedium?: string;
  imgLarge?: string;
}

interface ChallengeResponseDTO {
  type: ChallengeType;
  anime: AnimeInfo;
  data: Record<string, unknown>;
}

interface ChallengeState {
  guesses: { text: string; correct: boolean }[];
  solved: boolean;
  skipped: boolean;
  currentPhotoIndex: number;
  solvedAtPhotoIndex: number;
  showConfetti: boolean;
}

// ---------------------------------------------------------------------------
// Difficulty helper (for "anime" type)
// ---------------------------------------------------------------------------

const PHOTO_DIFFICULTY_LABELS = ['DIFÍCIL', 'MEDIA', 'FÁCIL', 'MUY FÁCIL'];

function getDifficultyAtIndex(index: number): string {
  return PHOTO_DIFFICULTY_LABELS[index] ?? 'DESCONOCIDA';
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = {
  page: 'min-h-screen bg-app-bg flex font-gabarito overflow-hidden',
  leftBg: 'w-[350px] flex-shrink-0 bg-cover bg-right-top',
  rightBg: 'w-[350px] flex-shrink-0 bg-cover bg-left-top',
  center: 'flex-1 flex flex-col items-center bg-white relative overflow-y-auto',

  // Top bar — cohesive with Navbar row 1 style
  topBar: 'w-full flex items-center justify-between px-8 py-3 border-b border-border bg-white sticky top-0 z-10',
  logoImg: 'h-[38px] object-contain',
  topBarBadge: 'inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-semibold px-3 py-1.5 rounded-pill',

  // Title block
  title: 'text-[52px] font-bold text-text-main mt-5 mb-0.5 leading-none',
  titleAccentBar: 'block w-16 h-1 bg-primary rounded-full mx-auto mt-2 mb-2',
  subtitle: 'text-sm text-text-muted mb-4',

  // Challenge image area — dark gradient instead of raw black
  imageArea: 'w-[590px] h-[332px] rounded-card mb-3 overflow-hidden relative border border-border',
  imageAreaBg: 'absolute inset-0 bg-gradient-to-b from-[#1a1a2e] to-[#16213e]',

  // Outcome banner — design-system tokens
  outcomeBannerOk: 'w-[590px] rounded-btn px-5 py-4 flex flex-col gap-1.5 mb-2 transition-all bg-primary/10 border border-primary/40',
  outcomeBannerFail: 'w-[590px] rounded-btn px-5 py-4 flex flex-col gap-1.5 mb-2 transition-all bg-status-red/10 border border-status-red/40',

  // Skip button — amber CTA style
  skipBtn: 'h-[47px] px-5 bg-primary text-white rounded-btn text-sm font-semibold hover:bg-primary-dark transition-colors',

  // Lives bar
  lifeBarWrapper: 'flex items-center gap-2 px-1',
  lifeBarLabel: 'text-xs font-semibold text-text-secondary mr-1',
  lifeDotActive: 'w-10 h-2.5 rounded-full bg-status-red transition-all duration-300',
  lifeDotInactive: 'w-10 h-2.5 rounded-full bg-border transition-all duration-300',
  lifeBarCount: 'text-xs text-text-muted ml-1',

  // Guess history
  guessList: 'w-[590px] flex flex-col gap-2 mt-3 pb-2',
  guessListLabel: 'text-xs font-semibold text-text-muted uppercase tracking-widest px-1 mb-1',
  guess: 'h-[56px] rounded-btn flex items-center gap-4 px-5 text-sm font-medium transition-all',
  guessOk: 'bg-primary/10 border border-primary/30',
  guessWrong: 'bg-status-red/5 border border-status-red/30',
  guessIcon: 'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
  guessIconOk: 'bg-primary',
  guessIconWrong: 'bg-status-red',
};

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className={styles.center}>
      <div className={styles.topBar}>
        <div className="h-[38px] w-32 bg-app-bg rounded animate-pulse" />
        <div className="h-7 w-24 bg-app-bg rounded-pill animate-pulse" />
      </div>
      <div className="text-[52px] font-bold text-text-main mt-5 mb-0.5 opacity-20 leading-none">Animedle</div>
      <div className="w-16 h-1 bg-app-bg rounded-full mx-auto mt-2 mb-4 animate-pulse" />
      <div className="w-[590px] h-[332px] bg-app-bg rounded-card mb-3 animate-pulse border border-border" />
      <div className="w-[590px] h-[47px] bg-app-bg rounded-btn animate-pulse" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Animedle() {
  const [challenges, setChallenges] = useState<ChallengeResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [states, setStates] = useState<ChallengeState[]>([]);

  useEffect(() => {
    axios
      .get<{ success: boolean; data: { challenges: ChallengeResponseDTO[]; date: string } }>(
        `${BASE}/challenges/daily`
      )
      .then((res) => {
        const { challenges: fetchedChallenges } = res.data.data;
        setChallenges(fetchedChallenges);
        setStates(
          fetchedChallenges.map(() => ({
            guesses: [],
            solved: false,
            skipped: false,
            currentPhotoIndex: 0,
            solvedAtPhotoIndex: 0,
            showConfetti: false,
          }))
        );
      })
      .catch(() => setError('No se pudieron cargar los retos de hoy. Inténtalo más tarde.'))
      .finally(() => setLoading(false));
  }, []);

  function handleGuess(animeName: string) {
    const challenge = challenges[activeChallenge];
    const state = states[activeChallenge];
    if (!challenge || state.solved || state.skipped) return;

    const wrongSoFar = state.guesses.filter((g) => !g.correct).length;
    if (wrongSoFar >= MAX_WRONG_GUESSES) return;

    const isCorrect = animeName.trim().toLowerCase() === challenge.anime.name.toLowerCase();
    const newGuess = { text: animeName.trim(), correct: isCorrect };

    setStates((prev) =>
      prev.map((s, i) => {
        if (i !== activeChallenge) return s;
        const newGuesses = [...s.guesses, newGuess];
        const newWrongCount = newGuesses.filter((g) => !g.correct).length;
        // On a correct guess keep the current index (that's the difficulty the user solved at);
        // on a wrong guess auto-advance to the next photo (up to 3).
        const newPhotoIndex = isCorrect
          ? s.currentPhotoIndex
          : challenge.type === 'anime'
            ? Math.min(newWrongCount, 3)
            : s.currentPhotoIndex;
        // Record which photo index the user was viewing when they guessed correctly.
        const solvedAtPhotoIndex = isCorrect ? s.currentPhotoIndex : s.solvedAtPhotoIndex;
        return {
          ...s,
          guesses: newGuesses,
          solved: isCorrect,
          showConfetti: isCorrect,
          currentPhotoIndex: newPhotoIndex,
          solvedAtPhotoIndex,
        };
      })
    );
  }

  function handleSkip() {
    const state = states[activeChallenge];
    if (!state || state.solved || state.skipped) return;
    setStates((prev) =>
      prev.map((s, i) => (i === activeChallenge ? { ...s, skipped: true } : s))
    );
  }

  // Clear confetti 3 seconds after a challenge is solved (Bug 2 fix: useEffect instead of inline ref callback)
  useEffect(() => {
    const state = states[activeChallenge];
    if (!state?.solved) return;
    const timer = setTimeout(() => {
      setStates((prev) =>
        prev.map((s, i) => (i === activeChallenge ? { ...s, showConfetti: false } : s))
      );
    }, 3000);
    return () => clearTimeout(timer);
  }, [states[activeChallenge]?.solved, activeChallenge]);

  // Compute tab state for ChallengeTabBar
  function getTabState(
    index: number
  ): 'neutral' | 'active' | 'solved' | 'failed' | 'skipped' {
    if (index === activeChallenge) return 'active';
    if (!states[index]) return 'neutral';
    const s = states[index];
    if (s.solved) return 'solved';
    if (s.skipped) return 'skipped';
    const wrongCount = s.guesses.filter((g) => !g.correct).length;
    if (wrongCount >= MAX_WRONG_GUESSES) return 'failed';
    return 'neutral';
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.leftBg} style={{ backgroundImage: 'url(/bg_clouds.png)' }} />
        <LoadingSkeleton />
        <div
          className={styles.rightBg}
          style={{ backgroundImage: 'url(/bg_clouds.png)', transform: 'scaleX(-1)' }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.leftBg} style={{ backgroundImage: 'url(/bg_clouds.png)' }} />
        <div className={styles.center}>
          <div className={styles.topBar}>
            <img src={rekkoLogo} alt="Rekko" className={styles.logoImg} />
            <span className={styles.topBarBadge}>Juego diario</span>
          </div>
          <h1 className={styles.title}>Animedle</h1>
          <span className={styles.titleAccentBar} />
          <p className="mt-8 text-status-red text-sm">{error}</p>
        </div>
        <div
          className={styles.rightBg}
          style={{ backgroundImage: 'url(/bg_clouds.png)', transform: 'scaleX(-1)' }}
        />
      </div>
    );
  }

  const challenge = challenges[activeChallenge];
  const state = states[activeChallenge];

  if (!challenge || !state) return null;

  const wrongGuessCount = state.guesses.filter((g) => !g.correct).length;
  const isAutoFailed = !state.solved && !state.skipped && wrongGuessCount >= MAX_WRONG_GUESSES;
  const challengeOver = state.solved || state.skipped || isAutoFailed;

  const tabs = challenges.map((c, i) => ({
    type: c.type,
    state: getTabState(i) as 'neutral' | 'active' | 'solved' | 'failed' | 'skipped',
    index: i,
  }));

  return (
    <div className={styles.page}>
      <Seo
        title={seoPages.animedle.title}
        description={seoPages.animedle.description}
        canonicalPath={seoPages.animedle.path}
        jsonLd={pageJsonLd({
          type: seoPages.animedle.schemaType,
          path: seoPages.animedle.path,
          name: seoPages.animedle.title,
          description: seoPages.animedle.description,
          image: seoPages.animedle.image ?? '/rekko_logo.png',
        })}
      />

      {/* Side backgrounds */}
      <div className={styles.leftBg} style={{ backgroundImage: 'url(/bg_clouds.png)' }} />

      <div className={styles.center}>
        {/* Confetti */}
        {state.showConfetti && (
          <ConfettiEffect key={`confetti-${activeChallenge}`} />
        )}

        {/* Top bar — logo left, game badge right */}
        <div className={styles.topBar}>
          <img src={rekkoLogo} alt="Rekko" className={styles.logoImg} />
          <span className={styles.topBarBadge}>Juego diario</span>
        </div>

        {/* Title with amber accent underline */}
        <h1 className={styles.title}>Animedle</h1>
        <span className={styles.titleAccentBar} />
        <p className={styles.subtitle}>Adivina el anime del día — 4 retos</p>

        {/* Challenge tabs */}
        {challenges.length > 1 && (
          <ChallengeTabBar
            tabs={tabs}
            activeIndex={activeChallenge}
            onSelect={setActiveChallenge}
          />
        )}

        {/* Challenge content area — dark gradient background */}
        <div className={styles.imageArea}>
          <div className={styles.imageAreaBg} />
          {challenge.type === 'anime' && (
            <AnimeChallengeView
              data={challenge.data as Parameters<typeof AnimeChallengeView>[0]['data']}
              wrongGuesses={wrongGuessCount}
              currentPhotoIndex={state.currentPhotoIndex}
              onPhotoIndexChange={(idx) =>
                setStates((prev) =>
                  prev.map((s, i) =>
                    i === activeChallenge ? { ...s, currentPhotoIndex: idx } : s
                  )
                )
              }
            />
          )}

          {challenge.type === 'character' && (
            <CharacterChallengeView
              data={challenge.data as Parameters<typeof CharacterChallengeView>[0]['data']}
              wrongGuesses={wrongGuessCount}
            />
          )}

          {challenge.type === 'opening' && (
            <OpeningChallengeView
              data={challenge.data as Parameters<typeof OpeningChallengeView>[0]['data']}
            />
          )}

          {challenge.type === 'emoji' && (
            <EmojiChallengeView
              data={challenge.data as Parameters<typeof EmojiChallengeView>[0]['data']}
            />
          )}
        </div>

        {/* Outcome banner — design-system tokens */}
        {challengeOver && (
          <div className={state.solved ? styles.outcomeBannerOk : styles.outcomeBannerFail}>
            {state.solved && (
              <>
                <p className="text-sm font-bold text-text-main flex items-center gap-2">
                  <Check size={16} className="text-status-green" />
                  ¡Correcto! Era{' '}
                  <span className="text-primary">{challenge.anime.name}</span>
                </p>
                {challenge.type === 'anime' && (
                  <p className="text-xs text-text-muted">
                    Resuelto en dificultad:{' '}
                    <strong>{getDifficultyAtIndex(state.solvedAtPhotoIndex)}</strong>
                  </p>
                )}
              </>
            )}
            {(state.skipped || isAutoFailed) && (
              <p className="text-sm font-bold text-text-main flex items-center gap-2">
                <X size={16} className="text-status-red" />
                {state.skipped ? 'Saltaste este reto.' : '¡Sin vidas!'} Era{' '}
                <span className="text-primary">{challenge.anime.name}</span>
              </p>
            )}

            {/* Reveal anime image */}
            {challenge.anime.imgMedium && (
              <img
                src={challenge.anime.imgMedium}
                alt={challenge.anime.name}
                className="w-16 h-20 object-cover rounded-card mt-1"
              />
            )}

            {/* Navigate to next unsolved challenge (Bug 3 fix: wrap-around search) */}
            {(() => {
              let nextIdx = -1;
              for (let i = 1; i <= challenges.length; i++) {
                const idx = (activeChallenge + i) % challenges.length;
                const s = states[idx];
                if (s && !s.solved && !s.skipped) {
                  nextIdx = idx;
                  break;
                }
              }
              if (nextIdx === -1) return null;
              return (
                <button
                  onClick={() => setActiveChallenge(nextIdx)}
                  className="mt-1 self-start text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  Siguiente reto →
                </button>
              );
            })()}
          </div>
        )}

        {/* Input + skip */}
        {!challengeOver && (
          <div className="w-[590px] flex flex-col gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <AnimeGuessInput onGuess={handleGuess} disabled={challengeOver} />
              </div>
              <button onClick={handleSkip} className={styles.skipBtn}>
                Saltar
              </button>
            </div>

            {/* Lives bar — "Vidas:" label + prominent dots */}
            <div className={styles.lifeBarWrapper}>
              <span className={styles.lifeBarLabel}>Vidas:</span>
              {Array.from({ length: MAX_WRONG_GUESSES }).map((_, i) => (
                <div
                  key={i}
                  className={i < wrongGuessCount ? styles.lifeDotActive : styles.lifeDotInactive}
                />
              ))}
              <span className={styles.lifeBarCount}>
                {MAX_WRONG_GUESSES - wrongGuessCount} restante{MAX_WRONG_GUESSES - wrongGuessCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Guess history */}
        {state.guesses.length > 0 && (
          <div className={styles.guessList}>
            <p className={styles.guessListLabel}>Intentos</p>
            {[...state.guesses].reverse().map((g, i) => (
              <div
                key={i}
                className={`${styles.guess} ${g.correct ? styles.guessOk : styles.guessWrong}`}
              >
                <span
                  className={`${styles.guessIcon} ${
                    g.correct ? styles.guessIconOk : styles.guessIconWrong
                  }`}
                >
                  {g.correct ? (
                    <Check size={14} className="text-white" />
                  ) : (
                    <X size={14} className="text-white" />
                  )}
                </span>
                {g.text}
              </div>
            ))}
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-10" />
      </div>

      <div
        className={styles.rightBg}
        style={{ backgroundImage: 'url(/bg_clouds.png)', transform: 'scaleX(-1)' }}
      />
    </div>
  );
}
