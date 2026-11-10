/**
 * Tipi di dominio di Quota Campo.
 *
 * Tutte le entità di gioco sono definite qui (Costituzione, Principio II).
 * Il tipo `any` è vietato: ogni struttura è tipizzata in modo stretto.
 */

/** Attitudini: i quattro semi del mazzo. */
export const Attitudine = {
  FUMATORI: 'FUMATORI',
  RISSOSI: 'RISSOSI',
  MARATONETI: 'MARATONETI',
  IMPROVVISATI: 'IMPROVVISATI',
} as const;

export type Attitudine = (typeof Attitudine)[keyof typeof Attitudine];

export const ATTITUDINI: readonly Attitudine[] = [
  Attitudine.FUMATORI,
  Attitudine.RISSOSI,
  Attitudine.MARATONETI,
  Attitudine.IMPROVVISATI,
];

/** Tipologie di Azione riconosciute dal motore. */
export const AzioneType = {
  AZIONE_PERSONALE: 'AZIONE_PERSONALE',
  DAI_E_VAI: 'DAI_E_VAI',
  TIKI_TAKA: 'TIKI_TAKA',
  TRIANGOLO: 'TRIANGOLO',
  CONTROPIEDE: 'CONTROPIEDE',
  AZIONE_DI_REPARTO: 'AZIONE_DI_REPARTO',
  SCHEMA_SU_PUNIZIONE: 'SCHEMA_SU_PUNIZIONE',
  TORELLO: 'TORELLO',
  GOL_AL_VOLO: 'GOL_AL_VOLO',
} as const;

export type AzioneType = (typeof AzioneType)[keyof typeof AzioneType];

/** Singola carta da gioco. */
export interface Convocato {
  id: string;
  /** Valore nominale 2-14 (11 = J, 12 = Q, 13 = K, 14 = Asso). */
  valoreNominale: number;
  attitudine: Attitudine;
  /** Modificatore opzionale incollato alla carta (Edizioni, Sigilli). */
  equipaggiamento?: string;
}

/** Stato intermedio della pipeline di calcolo. */
export interface StatoCalcolo {
  tecnica: number;
  fomento: number;
}

/** Contesto informativo passato ai Fenomeni durante il calcolo. */
export type ContestoCalcolo = {
  /** Tutte le carte giocate, incluse quelle fuori dalla combo. */
  carteGiocate: Convocato[];
  /** Solo le carte che compongono attivamente la combo. */
  carteCombo: Convocato[];
  tipoAzione: AzioneType;
  numeroCarte: number;
  contieneCoppia: boolean;
};

/** Modificatore passivo posizionato a bordo campo. */
export interface Fenomeno {
  id: string;
  nome: string;
  descrizione: string;
  applicaEffetto: (
    statoAttuale: StatoCalcolo,
    contesto: Record<string, unknown>,
  ) => StatoCalcolo;
}

/** Combinazione di carte riconosciuta dal motore. */
export interface Azione {
  tipo: AzioneType;
  /** Carte che compongono attivamente la combo. */
  carte: Convocato[];
  tecnicaBase: number;
  fomentoBase: number;
}

/** Avversario (il Buio) da battere. */
export type TipoAvversario = 'BASE' | 'MEDIO' | 'BOSS';

export interface Avversario {
  id: string;
  nome: string;
  targetXG: number;
  tipo: TipoAvversario;
  /** Regola Malus applicata solo ai Boss. */
  malusRegola?: string;
}

/** Blocco di tre Avversari con target incrementali. */
export interface Mese {
  numero: number;
  avversari: Avversario[];
  targetBase: number;
}

/** Moneta di gioco. */
export interface Quote {
  quantita: number;
}

/** Mazzo di carte. */
export interface Mazzo {
  carte: Convocato[];
}

/** Stati della macchina a stati del game loop. */
export const StatoPartita = {
  INIT_MATCH: 'INIT_MATCH',
  SELECT_OPPONENT: 'SELECT_OPPONENT',
  DRAW_PHASE: 'DRAW_PHASE',
  PLAYER_ACTION: 'PLAYER_ACTION',
  CALCULATION_PHASE: 'CALCULATION_PHASE',
  RESOLUTION: 'RESOLUTION',
  SHOP_PHASE: 'SHOP_PHASE',
  GAME_OVER: 'GAME_OVER',
} as const;

export type StatoPartita = (typeof StatoPartita)[keyof typeof StatoPartita];

/** Esito dell'ultima partita. */
export type EsitoPartita = 'VITTORIA' | 'SCONFITTA';

/** Singola sessione contro un Avversario. */
export interface Partita {
  avversario: Avversario;
  maniDisponibili: number;
  scartiDisponibili: number;
  manoAttuale: Convocato[];
  mazzoRimanente: Convocato[];
  punteggioXG: number;
  stato: StatoPartita;
  fenomeniAttivi: Fenomeno[];
}

/** Offerta di un Fenomeno nel Bagagliaio. */
export interface OffertaFenomeno {
  fenomeno: Fenomeno;
  costo: number;
}

/** Pacchetto acquistabile nel Bagagliaio. */
export interface Pacchetto {
  id: string;
  nome: string;
  descrizione: string;
  costo: number;
  /** Quanti Fenomeni casuali contiene il pacchetto. */
  fenomeniInclusi: number;
}

/** Risultato completo di una giocata, usato anche dalla UI. */
export interface UltimaGiocata {
  azione: Azione;
  statoCalcolo: StatoCalcolo;
  xg: number;
  passaggi: string[];
}

// ---------------------------------------------------------------------------
// Guida
// ---------------------------------------------------------------------------

/** Singola sezione argomento della Guida (Regole). */
export interface GuidaContenuto {
  /** Identificatore univoco della sezione (es. `regole-base`). */
  id: string;
  /** Titolo mostrato nella scheda. */
  titolo: string;
  /** Contenuto testuale della sezione. */
  contenuto: string;
  /** Ordine di visualizzazione nelle schede: intero >= 0, univoco. */
  ordine: number;
}

// ---------------------------------------------------------------------------
// Tutorial
// ---------------------------------------------------------------------------

/** Fase scriptata della partita tutorial. */
export type TutorialFase = 1 | 2 | 3 | 4;

/** Stato della partita tutorial guidata. */
export interface TutorialStato {
  /** Indice della fase corrente: 1 La Mano, 2 Il Piazzamento, 3 Risoluzione e xG, 4 Fine Turno. */
  faseAttiva: TutorialFase;
  /** True quando tutte e quattro le fasi sono state completate. */
  completato: boolean;
  /** True quando le interazioni non necessarie devono essere bloccate. */
  interazioniBloccate: boolean;
  /** Identificatore dell'elemento UI da evidenziare nella fase corrente. */
  elementoTarget?: string;
  /** ID dei Convocati nel mazzo pre-ordinato (almeno 5). */
  mazzoOrdinato: string[];
  /** Parametri minimi dell'Avversario (il Buio) usato nel tutorial. */
  avversarioParametri: Avversario;
}

// ---------------------------------------------------------------------------
// Preferenze audio e primo avvio
// ---------------------------------------------------------------------------

/** Preferenze audio persistenti, con toggle indipendenti. */
export interface PreferenzeAudio {
  /** Musica di sottofondo attiva/disattiva (default true). */
  musicaAttiva: boolean;
  /** Effetti sonori attivi/disattivi (default true). */
  sfxAttivi: boolean;
}

/** Indicatore del primissimo avvio assoluto del gioco. */
export interface FlagPrimoAvvio {
  /** True se il gioco non è mai stato avviato prima (default true). */
  primoAvvio: boolean;
}
