import type { Fenomeno, PreferenzeAudio } from '../types';
import { fenomenoPerId } from '../data/fenomeni';

const CHIAVE_QUOTE = 'quota-campo:quote-v1';
const CHIAVE_FENOMENI = 'quota-campo:fenomeni-v1';
const CHIAVE_AUDIO = 'quota-campo:audio-preferenze-v1';
const CHIAVE_PRIMO_AVVIO = 'quota-campo:game-firstrun-v1';
const CHIAVE_TUTORIAL_COMPLETATO = 'quota-campo:tutorial-completato-v1';

/**
 * Alias legacy documentati in data-model.md e quickstart.md
 * (`audio.preferences`, `game.firstRun`, `tutorial.completed`).
 * Letti come fallback e migrati sulla chiave canonica al primo caricamento.
 */
const CHIAVE_AUDIO_ALIAS = 'audio.preferences';
const CHIAVE_PRIMO_AVVIO_ALIAS = 'game.firstRun';
const CHIAVE_TUTORIAL_COMPLETATO_ALIAS = 'tutorial.completed';

/** Legge la chiave canonica, con fallback all'alias legacy. */
function leggiConAlias(chiave: string, alias: string): string | null {
  const canonico = window.localStorage.getItem(chiave);
  if (canonico !== null) return canonico;
  return window.localStorage.getItem(alias);
}

/** Copia il valore letto dall'alias sulla chiave canonica (migrazione). */
function migraSuCanonica(chiave: string, valore: string): void {
  try {
    if (window.localStorage.getItem(chiave) === null) {
      window.localStorage.setItem(chiave, valore);
    }
  } catch {
    /* Migrazione non possibile: la lettura dell'alias resta valida. */
  }
}

const PREFERENZE_AUDIO_PREDEFINITE: PreferenzeAudio = {
  musicaAttiva: true,
  sfxAttivi: true,
};

function localStorageDisponibile(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/** Carica le Quote salvate; in caso di dato corrotto riparte da 0. */
export function caricaQuote(): number {
  if (!localStorageDisponibile()) return 0;

  try {
    const grezzo = window.localStorage.getItem(CHIAVE_QUOTE);
    if (grezzo === null) return 0;

    const valore = Number.parseInt(grezzo, 10);
    return Number.isFinite(valore) && valore >= 0 ? valore : 0;
  } catch {
    return 0;
  }
}

/** Salva le Quote correnti. */
export function salvaQuote(quote: number): void {
  if (!localStorageDisponibile()) return;

  try {
    window.localStorage.setItem(CHIAVE_QUOTE, String(Math.max(0, Math.floor(quote))));
  } catch {
    /* Storage non disponibile: la partita prosegue senza persistenza. */
  }
}

/** Ricarica i Fenomeni acquistati ricostruendoli dal catalogo per id. */
export function caricaFenomeni(): Fenomeno[] {
  if (!localStorageDisponibile()) return [];

  try {
    const grezzo = window.localStorage.getItem(CHIAVE_FENOMENI);
    if (grezzo === null) return [];

    const ids: unknown = JSON.parse(grezzo);
    if (!Array.isArray(ids)) return [];

    const fenomeni: Fenomeno[] = [];
    for (const id of ids) {
      if (typeof id !== 'string') continue;
      const fenomeno = fenomenoPerId(id);
      if (fenomeno && !fenomeni.some((attivo) => attivo.id === fenomeno.id)) {
        fenomeni.push(fenomeno);
      }
    }

    return fenomeni.slice(0, 5);
  } catch {
    return [];
  }
}

/** Salva gli id dei Fenomeni acquistati. */
export function salvaFenomeni(fenomeni: readonly Fenomeno[]): void {
  if (!localStorageDisponibile()) return;

  try {
    const ids = fenomeni.map((fenomeno) => fenomeno.id);
    window.localStorage.setItem(CHIAVE_FENOMENI, JSON.stringify(ids));
  } catch {
    /* Storage non disponibile: la partita prosegue senza persistenza. */
  }
}

/** Carica le preferenze audio; in caso di dato mancante o corrotto usa i default. */
export function caricaPreferenzeAudio(): PreferenzeAudio {
  if (!localStorageDisponibile()) return { ...PREFERENZE_AUDIO_PREDEFINITE };

  try {
    const grezzo = leggiConAlias(CHIAVE_AUDIO, CHIAVE_AUDIO_ALIAS);
    if (grezzo === null) return { ...PREFERENZE_AUDIO_PREDEFINITE };

    const valore: unknown = JSON.parse(grezzo);
    if (typeof valore !== 'object' || valore === null) {
      return { ...PREFERENZE_AUDIO_PREDEFINITE };
    }

    const candidato = valore as Partial<PreferenzeAudio>;
    const preferenze = {
      musicaAttiva:
        typeof candidato.musicaAttiva === 'boolean'
          ? candidato.musicaAttiva
          : PREFERENZE_AUDIO_PREDEFINITE.musicaAttiva,
      sfxAttivi:
        typeof candidato.sfxAttivi === 'boolean'
          ? candidato.sfxAttivi
          : PREFERENZE_AUDIO_PREDEFINITE.sfxAttivi,
    };
    migraSuCanonica(CHIAVE_AUDIO, JSON.stringify(preferenze));
    return preferenze;
  } catch {
    return { ...PREFERENZE_AUDIO_PREDEFINITE };
  }
}

/** Salva le preferenze audio correnti. */
export function salvaPreferenzeAudio(preferenze: PreferenzeAudio): void {
  if (!localStorageDisponibile()) return;

  try {
    window.localStorage.setItem(
      CHIAVE_AUDIO,
      JSON.stringify({
        musicaAttiva: preferenze.musicaAttiva,
        sfxAttivi: preferenze.sfxAttivi,
      }),
    );
  } catch {
    /* Storage non disponibile: le preferenze valgono solo per la sessione. */
  }
}

/**
 * Carica il flag di primo avvio.
 * In assenza di salvataggio il gioco è considerato al primissimo avvio.
 */
export function caricaFlagPrimoAvvio(): boolean {
  if (!localStorageDisponibile()) return true;

  try {
    const grezzo = leggiConAlias(CHIAVE_PRIMO_AVVIO, CHIAVE_PRIMO_AVVIO_ALIAS);
    if (grezzo === null) return true;
    const primoAvvio = grezzo !== 'false';
    migraSuCanonica(CHIAVE_PRIMO_AVVIO, String(primoAvvio));
    return primoAvvio;
  } catch {
    return true;
  }
}

/** Salva il flag di primo avvio. */
export function salvaFlagPrimoAvvio(primoAvvio: boolean): void {
  if (!localStorageDisponibile()) return;

  try {
    window.localStorage.setItem(CHIAVE_PRIMO_AVVIO, String(primoAvvio));
  } catch {
    /* Storage non disponibile: il flag vale solo per la sessione. */
  }
}

/** True se il giocatore ha già completato il Tutorial. */
export function caricaTutorialCompletato(): boolean {
  if (!localStorageDisponibile()) return false;

  try {
    const grezzo = leggiConAlias(
      CHIAVE_TUTORIAL_COMPLETATO,
      CHIAVE_TUTORIAL_COMPLETATO_ALIAS,
    );
    if (grezzo === null) return false;
    const completato = grezzo === 'true';
    migraSuCanonica(CHIAVE_TUTORIAL_COMPLETATO, String(completato));
    return completato;
  } catch {
    return false;
  }
}

/** Salva lo stato di completamento del Tutorial. */
export function salvaTutorialCompletato(completato: boolean): void {
  if (!localStorageDisponibile()) return;

  try {
    window.localStorage.setItem(CHIAVE_TUTORIAL_COMPLETATO, String(completato));
  } catch {
    /* Storage non disponibile: lo stato vale solo per la sessione. */
  }
}
