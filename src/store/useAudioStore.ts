import { create } from 'zustand';
import type { PreferenzeAudio } from '../types';
import { caricaPreferenzeAudio, salvaPreferenzeAudio } from '../utils/storage';

export interface AudioState extends PreferenzeAudio {
  setMusicaAttiva: (attiva: boolean) => void;
  setSfxAttivi: (attivi: boolean) => void;
}

const preferenzeIniziali = caricaPreferenzeAudio();

/**
 * Slice Zustand dedicato alle preferenze audio.
 *
 * Resta separato da `useGameStore` perché musica e SFX sono ortogonali
 * allo stato della partita (Costituzione, Principio II — slice modulari).
 */
export const useAudioStore = create<AudioState>()((set, get) => ({
  musicaAttiva: preferenzeIniziali.musicaAttiva,
  sfxAttivi: preferenzeIniziali.sfxAttivi,

  setMusicaAttiva: (attiva: boolean) => {
    set({ musicaAttiva: attiva });
    salvaPreferenzeAudio({
      musicaAttiva: attiva,
      sfxAttivi: get().sfxAttivi,
    });
  },

  setSfxAttivi: (attivi: boolean) => {
    set({ sfxAttivi: attivi });
    salvaPreferenzeAudio({
      musicaAttiva: get().musicaAttiva,
      sfxAttivi: attivi,
    });
  },
}));
