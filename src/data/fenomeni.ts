import type { Convocato, Fenomeno, StatoCalcolo } from '../types';
import { Attitudine } from '../types';

/** Legge un numero dal contesto senza ricorrere a `any`. */
function numeroDalContesto(contesto: Record<string, unknown>, chiave: string): number {
  const valore = contesto[chiave];
  return typeof valore === 'number' ? valore : 0;
}

function isConvocato(valore: unknown): valore is Convocato {
  if (typeof valore !== 'object' || valore === null) return false;
  const candidato = valore as Record<string, unknown>;
  return (
    typeof candidato.id === 'string' &&
    typeof candidato.valoreNominale === 'number' &&
    typeof candidato.attitudine === 'string'
  );
}

/** Conta le carte IMPROVVISATI effettivamente giocate nella mano. */
function contaImprovvisati(contesto: Record<string, unknown>): number {
  const carte = contesto.carteGiocate;
  if (!Array.isArray(carte)) return 0;

  return carte.filter(
    (carta): carta is Convocato =>
      isConvocato(carta) && carta.attitudine === Attitudine.IMPROVVISATI,
  ).length;
}

/**
 * Catalogo dei Fenomeni disponibili nell'MVP.
 * Ogni `applicaEffetto` è una funzione pura: nessun effetto collaterale.
 */
export const CATALOGO_FENOMENI: readonly Fenomeno[] = [
  {
    id: 'proprietario-del-pallone',
    nome: 'Il Proprietario del Pallone',
    descrizione: '+4 Fomento fisso.',
    applicaEffetto: (stato: StatoCalcolo): StatoCalcolo => ({
      tecnica: stato.tecnica,
      fomento: stato.fomento + 4,
    }),
  },
  {
    id: 'ansioso',
    nome: "L'Ansioso",
    descrizione: '+15 Tecnica per ogni Convocato IMPROVVISATI giocato.',
    applicaEffetto: (
      stato: StatoCalcolo,
      contesto: Record<string, unknown>,
    ): StatoCalcolo => ({
      tecnica: stato.tecnica + 15 * contaImprovvisati(contesto),
      fomento: stato.fomento,
    }),
  },
  {
    id: 'bomber',
    nome: 'Il Bomber',
    descrizione: 'Moltiplica il Fomento totale ×2 se l’Azione contiene una Coppia.',
    applicaEffetto: (
      stato: StatoCalcolo,
      contesto: Record<string, unknown>,
    ): StatoCalcolo => {
      const contieneCoppia = contesto.contieneCoppia === true;
      return {
        tecnica: stato.tecnica,
        fomento: contieneCoppia ? stato.fomento * 2 : stato.fomento,
      };
    },
  },
  {
    id: 'arbitro-fiscale',
    nome: "L'Arbitro Fiscale",
    descrizione: '+20 Fomento se si giocano esattamente 3 carte.',
    applicaEffetto: (
      stato: StatoCalcolo,
      contesto: Record<string, unknown>,
    ): StatoCalcolo => {
      const numeroCarte = numeroDalContesto(contesto, 'numeroCarte');
      return {
        tecnica: stato.tecnica,
        fomento: numeroCarte === 3 ? stato.fomento + 20 : stato.fomento,
      };
    },
  },
];

/** Recupera un Fenomeno dal catalogo per id. */
export function fenomenoPerId(id: string): Fenomeno | undefined {
  return CATALOGO_FENOMENI.find((fenomeno) => fenomeno.id === id);
}
