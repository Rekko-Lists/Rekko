import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Compass, Check } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import PlatformSelector, { type ImportPlatform } from '@/components/ui/import/PlatformSelector';
import ImportModal from '@/components/ui/import/ImportModal';
import { dismissWelcome } from '@/lib/welcome';
import Seo from '@/components/seo/Seo';

const styles = {
  page:        'min-h-screen font-gabarito px-4 py-8 md:px-[8%] md:py-12',
  shell:       'mx-auto max-w-3xl',
  // Hero
  hero:        'relative overflow-hidden rounded-[20px] p-7 md:p-10 text-white shadow-card',
  heroEyebrow: 'inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm',
  heroTitle:   'mt-4 text-2xl md:text-4xl font-bold leading-tight',
  heroText:    'mt-3 max-w-xl text-sm md:text-base text-white/85 leading-relaxed',
  // Import section
  card:        'mt-6 rounded-[18px] bg-white p-6 shadow-card',
  cardTitle:   'flex items-center gap-2 text-lg font-semibold text-text-main',
  cardText:    'mt-1 text-sm text-text-secondary leading-relaxed',
  selectorWrap:'mt-5',
  manualRow:   'mt-4 flex items-center justify-between gap-3 flex-wrap',
  manualHint:  'text-xs text-text-muted',
  skipBtn:     'text-xs font-medium text-text-secondary hover:text-text-main transition-colors',
  // Guide
  guideCard:   'mt-6 rounded-[18px] bg-white p-6 shadow-card',
  guideTitle:  'text-lg font-semibold text-text-main',
  guideText:   'mt-1 text-sm text-text-secondary',
  steps:       'mt-5 space-y-4',
  step:        'flex gap-4',
  stepNum:     'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary',
  stepBody:    'min-w-0',
  stepTitle:   'text-sm font-semibold text-text-main',
  stepText:    'text-xs text-text-secondary mt-0.5 leading-relaxed',
  shotSlot:    'mt-3 flex h-32 items-center justify-center rounded-[10px] border-2 border-dashed border-border-light text-xs text-text-muted',
};

const GUIDE_STEPS = [
  {
    title: 'Build your list',
    text: 'Track what you watch, rate it and keep your progress in one place. Import it from MyAnimeList or AniList above, or add anime manually.',
  },
  {
    title: 'Share and discover',
    text: 'Post recommendations, discuss with other fans and explore what the community is watching this season.',
  },
  {
    title: 'Climb the leaderboard',
    text: 'Earn reputation from good posts and helpful comments, and keep your daily Animedle streak going.',
  },
];

export default function Welcome() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [importPlatform, setImportPlatform] = useState<ImportPlatform | null>(null);

  function handleSkip() {
    dismissWelcome();
    navigate('/feed');
  }

  return (
    <div className={styles.page}>
      <Seo title="Welcome to Rekko" description="Get started on Rekko — import your anime list and explore the community." noindex />

      <div className={styles.shell}>
        {/* Hero */}
        <section
          className={styles.hero}
          style={{ background: 'linear-gradient(135deg, #FF9E00 0%, #E89308 40%, #212834 120%)' }}
        >
          <span className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <span className={styles.heroEyebrow}>
            <Sparkles size={13} />
            Welcome setup
          </span>
          <h1 className={styles.heroTitle}>
            {user?.username ? `Hey ${user.username}, welcome to Rekko!` : 'Welcome to Rekko!'}
          </h1>
          <p className={styles.heroText}>
            Rekko is your home for tracking anime, sharing recommendations and meeting other fans.
            Let's get you set up in seconds.
          </p>
        </section>

        {/* Import */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Compass size={18} className="text-primary" />
            Coming from another platform?
          </h2>
          <p className={styles.cardText}>
            We can bring your whole anime list over in a snap. Pick where you're coming from:
          </p>

          <div className={styles.selectorWrap}>
            <PlatformSelector selected={importPlatform} onSelect={setImportPlatform} />
          </div>

          <div className={styles.manualRow}>
            <span className={styles.manualHint}>
              Prefer to start fresh? You can add anime manually from your list any time.
            </span>
            <button onClick={handleSkip} className={styles.skipBtn}>
              Skip for now
            </button>
          </div>
        </section>

        {/* Guide (screenshots added later) */}
        <section className={styles.guideCard}>
          <h2 className={styles.guideTitle}>How Rekko works</h2>
          <p className={styles.guideText}>A quick tour of what you can do here.</p>

          <div className={styles.steps}>
            {GUIDE_STEPS.map((step, i) => (
              <div key={step.title} className={styles.step}>
                <div className={styles.stepNum}>{i + 1}</div>
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                  <div className={styles.shotSlot}>Screenshot coming soon</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSkip}
            className="mt-6 inline-flex items-center gap-1.5 rounded-[8px] bg-gradient-to-b from-grad-start to-grad-end px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Check size={15} />
            Got it, take me to the feed
            <ArrowRight size={15} />
          </button>
        </section>
      </div>

      {/* Import modal opens pre-selected to the clicked platform */}
      {importPlatform && (
        <ImportModal
          defaultPlatform={importPlatform}
          onClose={() => setImportPlatform(null)}
        />
      )}
    </div>
  );
}
