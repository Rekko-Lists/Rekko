import { useState } from 'react';
import { Check, X } from 'lucide-react';
import rekkoLogo from '@/assets/rekko_logo.png';
import rekkoSword from '@/assets/rekko_sword.png';

interface Guess {
  text: string;
  correct: boolean;
}

const MAX_LIVES = 4;

const styles = {
  page:        'min-h-screen bg-app-bg flex font-gabarito overflow-hidden',
  leftBg:      'w-[350px] flex-shrink-0 bg-cover bg-right-top',
  rightBg:     'w-[350px] flex-shrink-0 bg-cover bg-left-top',
  center:      'flex-1 flex flex-col items-center bg-white relative',
  topBar:      'w-full flex items-center justify-between px-6 py-3 border-b border-border',
  logoImg:     'h-[42px] object-contain',
  apiLink:     'flex items-center gap-2 text-sm text-text-main cursor-pointer hover:text-primary transition-colors',
  title:       'text-[56px] font-bold text-text-main mt-6 mb-2',
  lives:       'flex gap-3 mb-4',
  lifeCloud:   'w-[58px] h-[40px] object-contain',
  imageArea:   'w-[590px] h-[332px] bg-black rounded-card mb-4 overflow-hidden',
  navRow:      'flex items-center justify-between w-[590px] mb-4',
  navBtn:      'flex items-center gap-2 h-[40px] px-5 bg-gradient-cta text-white text-sm rounded-btn cursor-pointer hover:opacity-90 transition-opacity',
  swordIcon:   'h-5 object-contain',
  inputRow:    'flex items-center w-[590px] mb-3',
  input:       'flex-1 h-[47px] border border-border rounded-l-btn px-4 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-text-secondary',
  submitBtn:   'h-[47px] w-[47px] bg-gradient-cta flex items-center justify-center rounded-r-btn cursor-pointer hover:opacity-90',
  guessList:   'w-[590px] flex flex-col gap-2',
  guess:       'h-[60px] rounded-btn flex items-center gap-4 px-5 text-sm font-medium',
  guessOk:     'bg-[#FFFDE7] border border-[#E8D44D]',
  guessWrong:  'bg-[#FFF0F0] border border-status-red',
  guessIcon:   'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
};

export default function Animedle() {
  const [input,  setInput]  = useState('');
  const [guesses, setGuesses] = useState<Guess[]>([
    { text: 'One piece',     correct: true  },
    { text: 'Jujutsu kaisen', correct: false },
  ]);

  const lives = MAX_LIVES - guesses.filter(g => !g.correct).length;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setGuesses(prev => [...prev, { text: input.trim(), correct: false }]);
    setInput('');
  }

  return (
    <div className={styles.page}>
      {/* Side cloud backgrounds */}
      <div className={styles.leftBg}  style={{ backgroundImage: 'url(/bg_clouds.png)' }} />

      <div className={styles.center}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <img src={rekkoLogo} alt="Rekko" className={styles.logoImg} />
          <span className={styles.apiLink}>
            <span className="text-lg">⊕</span> API Docs
          </span>
        </div>

        <h1 className={styles.title}>Animedle</h1>

        {/* Lives (clouds) */}
        <div className={styles.lives}>
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <div key={i} className="w-[58px] h-[40px] flex items-center justify-center">
              <div className={`w-10 h-7 rounded-full ${i < lives ? 'bg-primary' : 'bg-border'} opacity-${i < lives ? 100 : 40}`} />
            </div>
          ))}
        </div>

        {/* Anime silhouette */}
        <div className={styles.imageArea} />

        {/* Anterior / Siguiente */}
        <div className={styles.navRow}>
          <button className={styles.navBtn}>
            <img src={rekkoSword} alt="" className={styles.swordIcon} />
            Anterior
          </button>
          <button className={styles.navBtn}>
            Siguiente
            <img src={rekkoSword} alt="" className={`${styles.swordIcon} rotate-180`} />
          </button>
        </div>

        {/* Input */}
        <form className={styles.inputRow} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            placeholder="Nombre del anime..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit" className={styles.submitBtn}>
            <img src={rekkoSword} alt="Submit" className="h-5 object-contain" />
          </button>
        </form>

        {/* Previous guesses */}
        <div className={styles.guessList}>
          {guesses.map((g, i) => (
            <div key={i} className={`${styles.guess} ${g.correct ? styles.guessOk : styles.guessWrong}`}>
              <span className={`${styles.guessIcon} ${g.correct ? 'bg-[#E8D44D]' : 'bg-status-red'}`}>
                {g.correct ? <Check size={14} className="text-white" /> : <X size={14} className="text-white" />}
              </span>
              {g.text}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.rightBg} style={{ backgroundImage: 'url(/bg_clouds.png)', transform: 'scaleX(-1)' }} />
    </div>
  );
}
