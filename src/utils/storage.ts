import type { Fenomeno } from '../types';
import { fenomenoPerId } from '../data/fenomeni';

const CHIAVE_QUOTE = 'quota-campo:quote-v1';
const CHIAVE_FENOMENI = 'quota-campo:fenomeni-v1';

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
