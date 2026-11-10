import type {
  Convocato,
  ContestoCalcolo,
  Fenomeno,
  StatoCalcolo,
  UltimaGiocata,
} from '../types';
import { contieneCoppia, valutaAzione } from './evaluator';
import { valoreTecnicaCarta } from '../data/baseDeck';

/** Opzioni aggiuntive della pipeline di calcolo. */
export interface OpzioniCalcolo {
  /** Se true applica il Malus fisso dei Boss (Dai e Vai azzerato). */
  malusBoss?: boolean;
}

/** Modificatori incollati alle singole carte (Tacchetti, Sigilli, ...). */
const MODIFICATORI_CARTA: Record<
  string,
  (stato: StatoCalcolo) => StatoCalcolo
> = {
  'Tacchetti di Ferro': (stato) => ({
    tecnica: stato.tecnica + 5,
    fomento: stato.fomento,
  }),
  "Polmoni d'Acciaio": (stato) => ({
    tecnica: stato.tecnica,
    fomento: stato.fomento + 1,
  }),
};

function sommaTecnica(carte: readonly Convocato[]): number {
  return carte.reduce((totale, carta) => totale + valoreTecnicaCarta(carta), 0);
}

/**
 * Pipeline di calcolo xG, nell'ordine esatto imposto dalla Costituzione:
 * 1. Identificazione Azione (Tecnica/Fomento base)
 * 2. Valutazione Convocati (somma dei valori delle sole carte in combo)
 * 3. Trigger Modificatori Carta
 * 4. Pipeline Fenomeni, per indice [0...n] da sinistra a destra
 *
 * Poi xG = Tecnica Totale × Fomento Totale.
 */
export function calcolaXG(
  carteGiocate: readonly Convocato[],
  fenomeni: readonly Fenomeno[],
  opzioni: OpzioniCalcolo = {},
): UltimaGiocata | null {
  const azione = valutaAzione(carteGiocate);
  if (!azione) return null;

  const passaggi: string[] = [];

  // 1. Identificazione Azione.
  let stato: StatoCalcolo = {
    tecnica: azione.tecnicaBase,
    fomento: azione.fomentoBase,
  };
  passaggi.push(
    `Azione: ${azione.tipo} → Tecnica ${azione.tecnicaBase} × Fomento ${azione.fomentoBase}`,
  );

  if (opzioni.malusBoss === true && azione.tipo === 'DAI_E_VAI') {
    stato = { tecnica: 0, fomento: 0 };
    passaggi.push('Malus Boss: Tecnica e Fomento base azzerati (Dai e Vai)');
  }

  // 2. Valutazione Convocati: solo le carte che compongono la combo.
  const tecnicaConvocati = sommaTecnica(azione.carte);
  stato = { tecnica: stato.tecnica + tecnicaConvocati, fomento: stato.fomento };
  passaggi.push(
    `Convocati: +${tecnicaConvocati} Tecnica (${azione.carte.length} carte in combo)`,
  );

  // 3. Trigger Modificatori Carta.
  for (const carta of azione.carte) {
    if (!carta.equipaggiamento) continue;
    const modificatore = MODIFICATORI_CARTA[carta.equipaggiamento];
    if (!modificatore) continue;
    stato = modificatore(stato);
    passaggi.push(`${carta.equipaggiamento}: modificatore applicato`);
  }

  // 4. Pipeline dei Fenomeni, rigorosamente da sinistra a destra.
  const contesto: ContestoCalcolo = {
    carteGiocate: [...carteGiocate],
    carteCombo: [...azione.carte],
    tipoAzione: azione.tipo,
    numeroCarte: carteGiocate.length,
    contieneCoppia: contieneCoppia(azione.carte),
  };

  for (const fenomeno of fenomeni) {
    const precedente = stato;
    stato = fenomeno.applicaEffetto(stato, contesto);
    passaggi.push(
      `${fenomeno.nome}: Tecnica ${precedente.tecnica}→${stato.tecnica}, Fomento ${precedente.fomento}→${stato.fomento}`,
    );
  }

  return {
    azione,
    statoCalcolo: stato,
    xg: stato.tecnica * stato.fomento,
    passaggi,
  };
}
