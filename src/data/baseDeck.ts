import type { Convocato } from '../types';
import { ATTITUDINI, Attitudine } from '../types';
import { mescola } from '../utils/random';

/**
 * Genera il mazzo standard di 52 Convocati:
 * 13 valori (2-14) per ognuna delle 4 Attitudini.
 */
export function creaMazzoBase(): Convocato[] {
  const carte: Convocato[] = [];

  for (const attitudine of ATTITUDINI) {
    for (let valoreNominale = 2; valoreNominale <= 14; valoreNominale += 1) {
      carte.push({
        id: `${attitudine}-${valoreNominale}`,
        valoreNominale,
        attitudine,
      });
    }
  }

  return carte;
}

/** Fisher-Yates: restituisce una nuova copia mescolata del mazzo. */
export function mescolaMazzo(carte: readonly Convocato[]): Convocato[] {
  return mescola(carte);
}

/**
 * Valore di Tecnica di una carta: 2-10 valgono il nominale,
 * J/Q/K valgono 10, l'Asso vale 11.
 */
export function valoreTecnicaCarta(carta: Convocato): number {
  if (carta.valoreNominale >= 11 && carta.valoreNominale <= 13) {
    return 10;
  }
  if (carta.valoreNominale === 14) {
    return 11;
  }
  return carta.valoreNominale;
}

/** Etichetta leggibile di un valore nominale. */
export function etichettaValore(valoreNominale: number): string {
  if (valoreNominale === 11) return 'J';
  if (valoreNominale === 12) return 'Q';
  if (valoreNominale === 13) return 'K';
  if (valoreNominale === 14) return 'A';
  return String(valoreNominale);
}

/** Simbolo e colore associati a ogni Attitudine. */
export const STILE_ATTITUDINE: Record<
  Attitudine,
  { simbolo: string; etichetta: string; testo: string; bordo: string; sfondo: string }
> = {
  [Attitudine.FUMATORI]: {
    simbolo: '🚬',
    etichetta: 'Fumatori',
    testo: 'text-emerald-300',
    bordo: 'border-emerald-500/60',
    sfondo: 'bg-emerald-950/40',
  },
  [Attitudine.RISSOSI]: {
    simbolo: '🥊',
    etichetta: 'Rissosi',
    testo: 'text-rose-300',
    bordo: 'border-rose-500/60',
    sfondo: 'bg-rose-950/40',
  },
  [Attitudine.MARATONETI]: {
    simbolo: '🏃',
    etichetta: 'Maratoneti',
    testo: 'text-sky-300',
    bordo: 'border-sky-500/60',
    sfondo: 'bg-sky-950/40',
  },
  [Attitudine.IMPROVVISATI]: {
    simbolo: '🎲',
    etichetta: 'Improvvisati',
    testo: 'text-amber-300',
    bordo: 'border-amber-500/60',
    sfondo: 'bg-amber-950/40',
  },
};
