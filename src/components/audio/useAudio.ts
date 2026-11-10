import { useCallback, useEffect, useRef } from 'react';

/** Effetti sonori richiesti dalla specifica. */
export type NomeSfx = 'click' | 'swoosh' | 'thud' | 'fischio' | 'goal' | 'errore';

/**
 * I file audio sono forniti separatamente (fuori dallo scope della feature).
 * Se presenti in `src/assets/audio/` vengono risolti da Vite; altrimenti si
 * usano i percorsi pubblici di fallback, così il gioco resta avviabile.
 */
const MODULI_AUDIO = import.meta.glob('../../assets/audio/**/*.{mp3,ogg,wav}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

function percorsoAudio(nomeFile: string, fallback: string): string {
  const trovato = Object.entries(MODULI_AUDIO).find(([percorso]) =>
    percorso.endsWith(`/${nomeFile}`),
  );
  return trovato ? trovato[1] : fallback;
}

const PERCORSO_BGM = percorsoAudio('bgm.mp3', '/audio/bgm.mp3');

const PERCORSI_SFX: Record<NomeSfx, string> = {
  click: percorsoAudio('click.mp3', '/audio/sfx/click.mp3'),
  swoosh: percorsoAudio('swoosh.mp3', '/audio/sfx/swoosh.mp3'),
  thud: percorsoAudio('thud.mp3', '/audio/sfx/thud.mp3'),
  fischio: percorsoAudio('fischio.mp3', '/audio/sfx/fischio.mp3'),
  goal: percorsoAudio('goal.mp3', '/audio/sfx/goal.mp3'),
  errore: percorsoAudio('errore.mp3', '/audio/sfx/errore.mp3'),
};

/**
 * Wrapper leggero sulle API Audio native di HTML5.
 *
 * - `playBgm` avvia una singola traccia in loop; se il browser blocca
 *   l'autoplay la chiamata fallisce in modo silenzioso (la decisione
 *   "solo dopo la prima interazione" è responsabilità di AudioManager).
 * - `playSfx` crea una nuova istanza per ogni effetto, così più SFX
 *   possono sovrapporsi senza interrompersi.
 */
export function useAudio() {
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      bgmRef.current?.pause();
      bgmRef.current = null;
    };
  }, []);

  const playBgm = useCallback(() => {
    if (typeof Audio === 'undefined') return;

    if (!bgmRef.current) {
      const audio = new Audio(PERCORSO_BGM);
      audio.loop = true;
      audio.volume = 0.35;
      bgmRef.current = audio;
    }

    const riproduzione = bgmRef.current.play();
    if (riproduzione) {
      void riproduzione.catch(() => {
        /* Autoplay bloccato o file non ancora disponibile. */
      });
    }
  }, []);

  const stopBgm = useCallback(() => {
    bgmRef.current?.pause();
  }, []);

  const playSfx = useCallback((nome: NomeSfx) => {
    if (typeof Audio === 'undefined') return;

    const audio = new Audio(PERCORSI_SFX[nome]);
    audio.volume = 0.6;
    const riproduzione = audio.play();
    if (riproduzione) {
      void riproduzione.catch(() => {
        /* File non ancora caricato o audio bloccato dal browser. */
      });
    }
  }, []);

  return { playBgm, stopBgm, playSfx };
}
