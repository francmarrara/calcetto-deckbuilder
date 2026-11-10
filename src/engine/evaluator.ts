import type { Azione, AzioneType, Convocato } from '../types';

export interface InfoAzione {
  tipo: AzioneType;
  nome: string;
  numeroCarte: number;
  tecnicaBase: number;
  fomentoBase: number;
}

/**
 * Valori base delle 9 Azioni riconosciute, in ordine crescente di potenza.
 * Fonte: data-model.md.
 */
export const INFO_AZIONI: Record<AzioneType, InfoAzione> = {
  AZIONE_PERSONALE: {
    tipo: 'AZIONE_PERSONALE',
    nome: 'Azione Personale',
    numeroCarte: 1,
    tecnicaBase: 5,
    fomentoBase: 1,
  },
  DAI_E_VAI: {
    tipo: 'DAI_E_VAI',
    nome: 'Dai e Vai',
    numeroCarte: 2,
    tecnicaBase: 10,
    fomentoBase: 2,
  },
  TIKI_TAKA: {
    tipo: 'TIKI_TAKA',
    nome: 'Tiki-Taka',
    numeroCarte: 4,
    tecnicaBase: 20,
    fomentoBase: 2,
  },
  TRIANGOLO: {
    tipo: 'TRIANGOLO',
    nome: 'Triangolo',
    numeroCarte: 3,
    tecnicaBase: 30,
    fomentoBase: 3,
  },
  CONTROPIEDE: {
    tipo: 'CONTROPIEDE',
    nome: 'Contropiede',
    numeroCarte: 5,
    tecnicaBase: 30,
    fomentoBase: 4,
  },
  AZIONE_DI_REPARTO: {
    tipo: 'AZIONE_DI_REPARTO',
    nome: 'Azione di Reparto',
    numeroCarte: 5,
    tecnicaBase: 35,
    fomentoBase: 4,
  },
  SCHEMA_SU_PUNIZIONE: {
    tipo: 'SCHEMA_SU_PUNIZIONE',
    nome: 'Schema su Punizione',
    numeroCarte: 5,
    tecnicaBase: 40,
    fomentoBase: 4,
  },
  TORELLO: {
    tipo: 'TORELLO',
    nome: 'Torello',
    numeroCarte: 4,
    tecnicaBase: 60,
    fomentoBase: 7,
  },
  GOL_AL_VOLO: {
    tipo: 'GOL_AL_VOLO',
    nome: 'Gol al Volo',
    numeroCarte: 5,
    tecnicaBase: 100,
    fomentoBase: 8,
  },
};

/** Priorità di riconoscimento: dalla combo più forte alla più debole. */
const PRIORITA: readonly AzioneType[] = [
  'GOL_AL_VOLO',
  'TORELLO',
  'SCHEMA_SU_PUNIZIONE',
  'AZIONE_DI_REPARTO',
  'CONTROPIEDE',
  'TRIANGOLO',
  'TIKI_TAKA',
  'DAI_E_VAI',
  'AZIONE_PERSONALE',
];

function raggruppaPerValore(carte: readonly Convocato[]): Map<number, Convocato[]> {
  const gruppi = new Map<number, Convocato[]>();

  for (const carta of carte) {
    const gruppo = gruppi.get(carta.valoreNominale) ?? [];
    gruppo.push(carta);
    gruppi.set(carta.valoreNominale, gruppo);
  }

  return gruppi;
}

function valoriOrdinati(carte: readonly Convocato[]): number[] {
  return carte.map((carta) => carta.valoreNominale).sort((a, b) => a - b);
}

function eScala(carte: readonly Convocato[]): boolean {
  if (carte.length !== 5) return false;

  const valori = valoriOrdinati(carte);
  const distinti = new Set(valori);
  if (distinti.size !== 5) return false;

  const consecutivi = valori.every((valore, indice) =>
    indice === 0 ? true : valore === valori[indice - 1] + 1,
  );
  if (consecutivi) return true;

  // Scala con Asso basso: A-2-3-4-5.
  return (
    valori[0] === 2 &&
    valori[1] === 3 &&
    valori[2] === 4 &&
    valori[3] === 5 &&
    valori[4] === 14
  );
}

function stessaAttitudine(carte: readonly Convocato[]): boolean {
  return carte.every((carta) => carta.attitudine === carte[0]?.attitudine);
}

function trovaRoyalFlush(carte: readonly Convocato[]): Convocato[] | null {
  if (carte.length !== 5 || !stessaAttitudine(carte)) return null;

  const valori = valoriOrdinati(carte);
  const royal = [10, 11, 12, 13, 14];
  return valori.every((valore, indice) => valore === royal[indice]) ? [...carte] : null;
}

function trovaPoker(carte: readonly Convocato[]): Convocato[] | null {
  const gruppi = raggruppaPerValore(carte);

  for (const gruppo of gruppi.values()) {
    if (gruppo.length >= 4) return gruppo.slice(0, 4);
  }

  return null;
}

function trovaFullHouse(carte: readonly Convocato[]): Convocato[] | null {
  if (carte.length !== 5) return null;

  const gruppi = [...raggruppaPerValore(carte).values()];
  const tris = gruppi.find((gruppo) => gruppo.length === 3);
  const coppia = gruppi.find((gruppo) => gruppo.length === 2);

  if (!tris || !coppia) return null;
  return [...tris, ...coppia];
}

function trovaColore(carte: readonly Convocato[]): Convocato[] | null {
  if (carte.length !== 5 || !stessaAttitudine(carte)) return null;
  return [...carte];
}

function trovaScala(carte: readonly Convocato[]): Convocato[] | null {
  return eScala(carte) ? [...carte] : null;
}

function trovaTris(carte: readonly Convocato[]): Convocato[] | null {
  const gruppi = raggruppaPerValore(carte);

  for (const gruppo of gruppi.values()) {
    if (gruppo.length >= 3) return gruppo.slice(0, 3);
  }

  return null;
}

function trovaDoppiaCoppia(carte: readonly Convocato[]): Convocato[] | null {
  const gruppi = [...raggruppaPerValore(carte).values()].filter(
    (gruppo) => gruppo.length >= 2,
  );

  if (gruppi.length < 2) return null;
  return [...gruppi[0].slice(0, 2), ...gruppi[1].slice(0, 2)];
}

function trovaCoppia(carte: readonly Convocato[]): Convocato[] | null {
  const gruppi = raggruppaPerValore(carte);

  for (const gruppo of gruppi.values()) {
    if (gruppo.length >= 2) return gruppo.slice(0, 2);
  }

  return null;
}

function trovaCartaAlta(carte: readonly Convocato[]): Convocato[] | null {
  if (carte.length === 0) return null;

  const migliore = carte.reduce((candidata, carta) =>
    carta.valoreNominale > candidata.valoreNominale ? carta : candidata,
  );

  return [migliore];
}

const RICONOSCITORI: Record<
  AzioneType,
  (carte: readonly Convocato[]) => Convocato[] | null
> = {
  GOL_AL_VOLO: trovaRoyalFlush,
  TORELLO: trovaPoker,
  SCHEMA_SU_PUNIZIONE: trovaFullHouse,
  AZIONE_DI_REPARTO: trovaColore,
  CONTROPIEDE: trovaScala,
  TRIANGOLO: trovaTris,
  TIKI_TAKA: trovaDoppiaCoppia,
  DAI_E_VAI: trovaCoppia,
  AZIONE_PERSONALE: trovaCartaAlta,
};

/**
 * Riconosce la migliore Azione contenuta nelle carte giocate.
 *
 * Le carte che non fanno parte della combo restano fuori da `carte`:
 * vengono comunque scartate ma non contribuiscono al punteggio.
 */
export function valutaAzione(carteGiocate: readonly Convocato[]): Azione | null {
  if (carteGiocate.length < 1 || carteGiocate.length > 5) return null;

  for (const tipo of PRIORITA) {
    const carteCombo = RICONOSCITORI[tipo](carteGiocate);
    if (carteCombo) {
      const info = INFO_AZIONI[tipo];
      return {
        tipo,
        carte: carteCombo,
        tecnicaBase: info.tecnicaBase,
        fomentoBase: info.fomentoBase,
      };
    }
  }

  return null;
}

/** True se la combo contiene almeno una coppia di valori uguali. */
export function contieneCoppia(carte: readonly Convocato[]): boolean {
  const gruppi = raggruppaPerValore(carte);
  return [...gruppi.values()].some((gruppo) => gruppo.length >= 2);
}
