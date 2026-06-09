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
import {
  type ChallengeResponseDTO,
  type AnimeData,
  type CharacterData,
  type OpeningData,
  type EmojiData,
  isAnimeData,
  isCharacterData,
  isOpeningData,
  isEmojiData,
} from '@/types/challenge';

const BASE = import.meta.env.VITE_API_BASE_URL as string;
const MAX_WRONG_GUESSES = 4;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChallengeState {
  guesses: { text: string; correct: boolean }[];
  solved: boolean;
  skipped: boolean;
  currentPhotoIndex: number;
  solvedAtPhotoIndex: number;
  showConfetti: boolean;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const BG_STYLE = {
  backgroundImage: 'url(/bg-clouds-banner.png)',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
} as const;

const styles = {
  // Single full-viewport background — bg image applied via BG_STYLE inline
  page:   'min-h-screen flex font-gabarito',

  // Side panels — transparent (show page bg), border line only
  leftBg:  'w-[350px] flex-shrink-0 border-r border-border/60',
  rightBg: 'w-[350px] flex-shrink-0 border-l border-border/60',

  center: 'flex-1 flex flex-col items-center bg-surface relative overflow-y-auto',

  // Top bar — dark gradient header like AdminPanel sidebar
  topBar:      'w-full flex items-center justify-between px-8 py-3 sticky top-0 z-10 bg-gradient-to-r from-grad-end to-grad-start border-b border-grad-end',
  logoImg:     'h-[38px] object-contain brightness-0 invert',
  topBarBadge: 'inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-pill',

  // Title block
  title:         'text-[56px] font-bold text-text-main mt-6 mb-0 leading-none',
  titleAccentBar:'block w-20 h-[3px] bg-primary rounded-full mx-auto mt-3 mb-1',
  subtitle:      'text-sm text-text-muted mb-5',

  // Challenge image area — prominent dark panel
  imageArea:    'w-[590px] h-[332px] rounded-btn mb-3 overflow-hidden relative border-2 border-grad-end/60 shadow-card',
  imageAreaBg:  'absolute inset-0 bg-gradient-to-b from-[#1a1a2e] to-[#16213e]',

  // Outcome banner
  outcomeBannerOk:   'w-[590px] rounded-btn px-5 py-4 flex flex-col gap-1.5 mb-2 bg-primary/10 border border-primary/40',
  outcomeBannerFail: 'w-[590px] rounded-btn px-5 py-4 flex flex-col gap-1.5 mb-2 bg-status-red/8 border border-status-red/40',

  // Skip button — dark gradient CTA like admin
  skipBtn: 'h-[47px] px-6 bg-gradient-to-b from-grad-start to-grad-end text-white rounded-btn text-sm font-semibold hover:opacity-90 transition-opacity',

  // Lives bar — card container with label
  livesCard:        'w-[590px] bg-app-bg rounded-btn border border-border px-4 py-3 flex items-center gap-3',
  lifeBarLabel:     'text-xs font-semibold text-text-secondary whitespace-nowrap',
  lifeDotsRow:      'flex items-center gap-2 flex-1',
  lifeDotActive:    'flex-1 h-3 rounded-full bg-status-red shadow-sm transition-all duration-300',
  lifeDotInactive:  'flex-1 h-3 rounded-full bg-border-light transition-all duration-300',
  lifeBarCount:     'text-xs font-medium text-text-secondary whitespace-nowrap',

  // Guess history
  guessList:      'w-[590px] flex flex-col gap-2 mt-3 pb-2',
  guessListLabel: 'text-[11px] font-semibold text-text-muted uppercase tracking-[0.12em] px-1 mb-1',
  guess:          'h-[52px] rounded-btn flex items-center gap-4 px-5 text-sm font-medium shadow-sm',
  guessOk:        'bg-primary/12 border border-primary/35 text-text-main',
  guessWrong:     'bg-surface border border-border text-text-muted',
  guessIcon:      'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
  guessIconOk:    'bg-primary',
  guessIconWrong: 'bg-status-red/70',
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
        if (import.meta.env.DEV) {
          console.log('[Animedle] challenges from /daily:', JSON.stringify(fetchedChallenges, null, 2));
        }
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
      <div className={styles.page} style={BG_STYLE}>
        <div className={styles.leftBg} />
        <LoadingSkeleton />
        <div className={styles.rightBg} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page} style={BG_STYLE}>
        <div className={styles.leftBg} />
        <div className={styles.center}>
          <div className={styles.topBar}>
            <img src={rekkoLogo} alt="Rekko" className={styles.logoImg} />
            <span className={styles.topBarBadge}>Juego diario</span>
          </div>
          <h1 className={styles.title}>Animedle</h1>
          <span className={styles.titleAccentBar} />
          <p className="mt-8 text-status-red text-sm">{error}</p>
        </div>
        <div className={styles.rightBg} />
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
    <div className={styles.page} style={BG_STYLE}>
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

      {/* Side panels — transparent, show page background */}
      <div className={styles.leftBg} />

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
          {isAnimeData(challenge.data, challenge.type) && (
            <AnimeChallengeView
              data={challenge.data as AnimeData}
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

          {isCharacterData(challenge.data, challenge.type) && (
            <CharacterChallengeView
              data={challenge.data as CharacterData}
              wrongGuesses={wrongGuessCount}
            />
          )}

          {isOpeningData(challenge.data, challenge.type) && (
            <OpeningChallengeView
              data={challenge.data as OpeningData}
            />
          )}

          {isEmojiData(challenge.data, challenge.type) && (
            <EmojiChallengeView
              data={challenge.data as EmojiData}
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
                    Resuelto en foto {state.solvedAtPhotoIndex + 1} de 4
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

            {/* Lives bar */}
            <div className={styles.livesCard}>
              <span className={styles.lifeBarLabel}>Vidas:</span>
              <div className={styles.lifeDotsRow}>
                {Array.from({ length: MAX_WRONG_GUESSES }).map((_, i) => (
                  <div
                    key={i}
                    className={i < wrongGuessCount ? styles.lifeDotActive : styles.lifeDotInactive}
                  />
                ))}
              </div>
              <span className={styles.lifeBarCount}>
                {MAX_WRONG_GUESSES - wrongGuessCount}/{MAX_WRONG_GUESSES}
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

      <div className={styles.rightBg} />
    </div>
  );
}
