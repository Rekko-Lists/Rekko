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
  center: 'flex-1 flex flex-col items-center bg-white relative',
  topBar: 'w-full flex items-center justify-between px-6 py-3 border-b border-border',
  logoImg: 'h-[42px] object-contain',
  apiLink: 'flex items-center gap-2 text-sm text-text-secondary cursor-default select-none',
  title: 'text-[52px] font-bold text-text-main mt-4 mb-1',
  subtitle: 'text-sm text-text-muted mb-3',
  imageArea: 'w-[590px] h-[332px] bg-black rounded-card mb-3 overflow-hidden relative',
  guessList: 'w-[590px] flex flex-col gap-2 mt-3',
  guess: 'h-[56px] rounded-btn flex items-center gap-4 px-5 text-sm font-medium',
  guessOk: 'bg-[#FFFDE7] border border-[#E8D44D]',
  guessWrong: 'bg-[#FFF0F0] border border-status-red',
  guessIcon: 'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
};

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className={styles.center}>
      <div className={styles.topBar}>
        <div className="h-[42px] w-32 bg-app-bg rounded animate-pulse" />
      </div>
      <div className="text-[52px] font-bold text-text-main mt-4 mb-1 opacity-30">Animedle</div>
      <div className="w-[590px] h-[332px] bg-app-bg rounded-card mb-3 animate-pulse" />
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
        const newPhotoIndex =
          challenge.type === 'anime' ? Math.min(newWrongCount, 3) : s.currentPhotoIndex;
        return {
          ...s,
          guesses: newGuesses,
          solved: isCorrect,
          showConfetti: isCorrect,
          currentPhotoIndex: newPhotoIndex,
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

  function clearConfetti(index: number) {
    setStates((prev) =>
      prev.map((s, i) => (i === index ? { ...s, showConfetti: false } : s))
    );
  }

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
          </div>
          <h1 className={styles.title}>Animedle</h1>
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
        {/* Clear confetti after short delay */}
        {state.showConfetti && (
          <span
            style={{ display: 'none' }}
            ref={() => {
              setTimeout(() => clearConfetti(activeChallenge), 3500);
            }}
          />
        )}

        {/* Top bar */}
        <div className={styles.topBar}>
          <img src={rekkoLogo} alt="Rekko" className={styles.logoImg} />
          <span className={styles.apiLink}>
            <span className="text-lg">⊕</span> API Docs
          </span>
        </div>

        {/* Title */}
        <h1 className={styles.title}>Animedle</h1>
        <p className={styles.subtitle}>Adivina el anime del día — 4 retos</p>

        {/* Challenge tabs */}
        {challenges.length > 1 && (
          <ChallengeTabBar
            tabs={tabs}
            activeIndex={activeChallenge}
            onSelect={setActiveChallenge}
          />
        )}

        {/* Challenge content area */}
        <div className={styles.imageArea}>
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

        {/* Outcome banner */}
        {challengeOver && (
          <div
            className={`w-[590px] rounded-btn px-5 py-3 flex flex-col gap-1 mb-2 transition-all ${
              state.solved
                ? 'bg-[#FFFDE7] border border-[#E8D44D]'
                : 'bg-[#FFF0F0] border border-status-red'
            }`}
          >
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
                    <strong>{getDifficultyAtIndex(state.currentPhotoIndex)}</strong>
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

            {/* Navigate to next unsolved challenge */}
            {(() => {
              const nextIdx = challenges.findIndex((_, i) => {
                if (i <= activeChallenge) return false;
                const s = states[i];
                return s && !s.solved && !s.skipped;
              });
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
              <button
                onClick={handleSkip}
                className="h-[47px] px-4 border border-border rounded-btn text-sm text-text-secondary hover:text-text-main hover:border-text-main transition-colors"
              >
                Saltar
              </button>
            </div>

            {/* Wrong guesses counter */}
            <div className="flex items-center gap-2 px-1">
              {Array.from({ length: MAX_WRONG_GUESSES }).map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-2 rounded-full transition-colors ${
                    i < wrongGuessCount ? 'bg-status-red' : 'bg-border'
                  }`}
                />
              ))}
              <span className="text-xs text-text-muted ml-1">
                {MAX_WRONG_GUESSES - wrongGuessCount} intento{MAX_WRONG_GUESSES - wrongGuessCount !== 1 ? 's' : ''} restante{MAX_WRONG_GUESSES - wrongGuessCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Guess history */}
        {state.guesses.length > 0 && (
          <div className={styles.guessList}>
            {[...state.guesses].reverse().map((g, i) => (
              <div
                key={i}
                className={`${styles.guess} ${g.correct ? styles.guessOk : styles.guessWrong}`}
              >
                <span
                  className={`${styles.guessIcon} ${
                    g.correct ? 'bg-[#E8D44D]' : 'bg-status-red'
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
