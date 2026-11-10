import type { Pacchetto } from '../types';

/** Pacchetti acquistabili nel Bagagliaio. Contengono Fenomeni casuali. */
export const CATALOGO_PACCHETTI: readonly Pacchetto[] = [
  {
    id: 'pacchetto-spogliatoio',
    nome: 'Pacchetto Spogliatoio',
    descrizione: 'Un Fenomeno casuale entra a bordo campo.',
    costo: 8,
    fenomeniInclusi: 1,
  },
  {
    id: 'pacchetto-terzo-tempo',
    nome: 'Pacchetto Terzo Tempo',
    descrizione: 'Due Fenomeni casuali entrano a bordo campo.',
    costo: 14,
    fenomeniInclusi: 2,
  },
];
