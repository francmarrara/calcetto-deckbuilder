import { create } from 'zustand';
import type {
  Avversario,
  Convocato,
  EsitoPartita,
  Fenomeno,
  OffertaFenomeno,
  Pacchetto,
  StatoPartita,
  UltimaGiocata,
} from '../types';
import { creaMazzoBase, mescolaMazzo } from '../data/baseDeck';
import { CATALOGO_FENOMENI } from '../data/fenomeni';
import { CATALOGO_PACCHETTI } from '../data/pacchetti';
import {
  TARGET_BASE_INIZIALE,
  creaAvversariMese,
} from '../data/avversari';
import { calcolaXG } from '../engine/calculator';
import { caricaFenomeni, caricaQuote, salvaFenomeni, salvaQuote } from '../utils/storage';
import { mescola } from '../utils/random';

const DIMENSIONE_MANO = 8;
const MANI_INIZIALI = 4;
const SCARTI_INIZIALI = 3;

/** Massimo numero di Convocati giocabili in una singola Azione. */
export const MAX_CARTE_GIOCABILI = 5;
const MAX_FENOMENI = 5;
const COSTO_FENOMENO = 6;

// ---------------------------------------------------------------------------
// Helper puri
// ---------------------------------------------------------------------------

/** Pesca dal mazzo finché la mano non raggiunge la dimensione richiesta. */
function pescaFinoA(
  mano: readonly Convocato[],
  mazzo: readonly Convocato[],
  dimensione: number,
): { mano: Convocato[]; mazzo: Convocato[] } {
  const nuovaMano = [...mano];
  const mazzoRimanente = [...mazzo];

  while (nuovaMano.length < dimensione && mazzoRimanente.length > 0) {
    const carta = mazzoRimanente.shift();
    if (carta) nuovaMano.push(carta);
  }

  return { mano: nuovaMano, mazzo: mazzoRimanente };
}

/** Estrae fino a due Fenomeni non ancora attivi per il Bagagliaio. */
function creaOfferteFenomeni(attivi: readonly Fenomeno[]): OffertaFenomeno[] {
  const disponibili = CATALOGO_FENOMENI.filter(
    (fenomeno) => !attivi.some((attivo) => attivo.id === fenomeno.id),
  );

  return mescola(disponibili)
    .slice(0, 2)
    .map((fenomeno) => ({ fenomeno, costo: COSTO_FENOMENO }));
}

/** Estrae i due Pacchetti casuali del Bagagliaio. */
function creaOffertePacchetti(): Pacchetto[] {
  return mescola(CATALOGO_PACCHETTI).slice(0, 2);
}

/** Stato iniziale della partita, riutilizzato da reset e nuova run. */
function statoPartitaIniziale(): Pick<
  GameState,
  | 'avversario'
  | 'maniDisponibili'
  | 'scartiDisponibili'
  | 'punteggioXG'
  | 'selezionate'
  | 'ultimaGiocata'
  | 'esito'
  | 'messaggio'
  | 'ultimoGuadagno'
> {
  return {
    avversario: null,
    maniDisponibili: MANI_INIZIALI,
    scartiDisponibili: SCARTI_INIZIALI,
    punteggioXG: 0,
    selezionate: [],
    ultimaGiocata: null,
    esito: null,
    messaggio: null,
    ultimoGuadagno: 0,
  };
}

// ---------------------------------------------------------------------------
// Slice dello stato
// ---------------------------------------------------------------------------

export interface GameState {
  stato: StatoPartita;
  mese: number;
  targetBaseMese: number;
  indiceAvversario: number;
  avversariMese: Avversario[];
  avversario: Avversario | null;
  maniDisponibili: number;
  scartiDisponibili: number;
  punteggioXG: number;
  selezionate: string[];
  ultimaGiocata: UltimaGiocata | null;
  esito: EsitoPartita | null;
  messaggio: string | null;
  ultimoGuadagno: number;
}

export interface DeckState {
  mazzo: Convocato[];
  mazzoRimanente: Convocato[];
  manoAttuale: Convocato[];
}

export interface EconomyState {
  quote: number;
  fenomeniAttivi: Fenomeno[];
  shopFenomeni: OffertaFenomeno[];
  shopPacchetti: Pacchetto[];
}

export interface GameActions {
  avviaRun: () => void;
  avviaPartitaTutorial: (
    mazzoOrdinato: readonly string[],
    avversario: Avversario,
  ) => void;
  entraInPiazzamento: () => void;
  selezionaAvversario: (id: string) => void;
  pescaCarte: () => void;
  selezionaCarta: (id: string) => void;
  deselezionaTutte: () => void;
  scartaSelezionate: () => void;
  giocaSelezionate: () => void;
  valutaRisultato: () => void;
  riordinaFenomeni: (activeId: string, overId: string) => void;
  riordinaMano: (activeId: string, overId: string) => void;
  acquistaFenomeno: (fenomenoId: string) => void;
  acquistaPacchetto: (pacchettoId: string) => void;
  prossimoAvversario: () => void;
  nuovaRun: () => void;
  pulisciMessaggio: () => void;
}

export type GameStore = GameState & DeckState & EconomyState & GameActions;

const fenomeniIniziali = caricaFenomeni();

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useGameStore = create<GameStore>()((set, get) => ({
  // GameState
  stato: 'INIT_MATCH',
  mese: 1,
  targetBaseMese: TARGET_BASE_INIZIALE,
  indiceAvversario: 0,
  avversariMese: creaAvversariMese(1, TARGET_BASE_INIZIALE),
  ...statoPartitaIniziale(),

  // DeckState
  mazzo: [],
  mazzoRimanente: [],
  manoAttuale: [],

  // EconomyState
  quote: caricaQuote(),
  fenomeniAttivi: fenomeniIniziali,
  shopFenomeni: [],
  shopPacchetti: [],

  avviaRun: () => {
    set({ stato: 'SELECT_OPPONENT', messaggio: null });
  },

  avviaPartitaTutorial: (mazzoOrdinato: readonly string[], avversario: Avversario) => {
    const mazzoBase = creaMazzoBase();
    const catalogo = new Map(mazzoBase.map((convocato) => [convocato.id, convocato]));

    const carteOrdinate = mazzoOrdinato
      .map((id) => catalogo.get(id))
      .filter((convocato): convocato is Convocato => convocato !== undefined);
    const idOrdinati = new Set(carteOrdinate.map((convocato) => convocato.id));
    const restoDelMazzo = mescolaMazzo(
      mazzoBase.filter((convocato) => !idOrdinati.has(convocato.id)),
    );
    const mazzoCompleto = [...carteOrdinate, ...restoDelMazzo];

    const { mano, mazzo } = pescaFinoA([], mazzoCompleto, DIMENSIONE_MANO);

    // Costituzione V: il tutorial percorre la macchina a stati reale
    // INIT_MATCH (mazzo pre-ordinato) → SELECT_OPPONENT (Avversario con
    // parametri minimi) → DRAW_PHASE (mano iniziale della fase 1).
    set({ ...statoPartitaIniziale(), stato: 'INIT_MATCH' });
    set({ stato: 'SELECT_OPPONENT', avversario, messaggio: null });
    set({
      stato: 'DRAW_PHASE',
      mazzo: mazzoCompleto,
      mazzoRimanente: mazzo,
      manoAttuale: mano,
    });
  },

  /** Transizione DRAW_PHASE → PLAYER_ACTION (fase tutorial 1 → 2). */
  entraInPiazzamento: () => {
    const stato = get();
    if (stato.stato !== 'DRAW_PHASE') return;
    set({ stato: 'PLAYER_ACTION', messaggio: null });
  },

  selezionaAvversario: (id: string) => {
    const stato = get();
    if (stato.stato !== 'SELECT_OPPONENT') return;

    const avversarioCorrente = stato.avversariMese[stato.indiceAvversario];
    if (!avversarioCorrente || avversarioCorrente.id !== id) {
      set({ messaggio: 'Questo Avversario non è ancora disponibile.' });
      return;
    }

    // Mazzo completo e rimescolato all'inizio di ogni partita.
    const mazzoCompleto = mescolaMazzo(creaMazzoBase());
    const { mano, mazzo } = pescaFinoA([], mazzoCompleto, DIMENSIONE_MANO);

    set({
      ...statoPartitaIniziale(),
      stato: 'DRAW_PHASE',
      avversario: avversarioCorrente,
      mazzo: mazzoCompleto,
      mazzoRimanente: mazzo,
      manoAttuale: mano,
    });

    set({ stato: 'PLAYER_ACTION' });
  },

  pescaCarte: () => {
    const stato = get();
    const { mano, mazzo } = pescaFinoA(
      stato.manoAttuale,
      stato.mazzoRimanente,
      DIMENSIONE_MANO,
    );

    set({ manoAttuale: mano, mazzoRimanente: mazzo });
  },

  selezionaCarta: (id: string) => {
    const stato = get();
    if (stato.stato !== 'PLAYER_ACTION') return;
    if (!stato.manoAttuale.some((carta) => carta.id === id)) return;

    if (stato.selezionate.includes(id)) {
      set({
        selezionate: stato.selezionate.filter((selezionata) => selezionata !== id),
        messaggio: null,
      });
      return;
    }

    if (stato.selezionate.length >= MAX_CARTE_GIOCABILI) {
      set({ messaggio: 'Puoi selezionare al massimo 5 Convocati.' });
      return;
    }

    set({ selezionate: [...stato.selezionate, id], messaggio: null });
  },

  deselezionaTutte: () => {
    set({ selezionate: [], messaggio: null });
  },

  scartaSelezionate: () => {
    const stato = get();
    if (stato.stato !== 'PLAYER_ACTION') return;

    if (stato.scartiDisponibili <= 0) {
      set({ messaggio: 'Non hai più Scarti disponibili.' });
      return;
    }

    if (stato.selezionate.length < 1) {
      set({ messaggio: 'Seleziona almeno un Convocato da scartare.' });
      return;
    }

    if (stato.selezionate.length > MAX_CARTE_GIOCABILI) {
      set({ messaggio: 'Puoi scartare al massimo 5 Convocati.' });
      return;
    }

    const selezionate = new Set(stato.selezionate);
    const manoResidua = stato.manoAttuale.filter((carta) => !selezionate.has(carta.id));
    set({ stato: 'DRAW_PHASE' });

    const { mano, mazzo } = pescaFinoA(
      manoResidua,
      stato.mazzoRimanente,
      DIMENSIONE_MANO,
    );

    set({
      stato: 'PLAYER_ACTION',
      manoAttuale: mano,
      mazzoRimanente: mazzo,
      scartiDisponibili: stato.scartiDisponibili - 1,
      selezionate: [],
      messaggio: null,
    });
  },

  giocaSelezionate: () => {
    const stato = get();
    if (stato.stato !== 'PLAYER_ACTION' || !stato.avversario) return;

    if (stato.selezionate.length < 1) {
      set({ messaggio: 'Seleziona almeno un Convocato per giocare un’Azione.' });
      return;
    }

    if (stato.selezionate.length > MAX_CARTE_GIOCABILI) {
      set({ messaggio: 'Puoi giocare al massimo 5 Convocati.' });
      return;
    }

    const selezionate = new Set(stato.selezionate);
    const carteGiocate = stato.manoAttuale.filter((carta) => selezionate.has(carta.id));

    set({ stato: 'CALCULATION_PHASE', messaggio: null });

    const giocata = calcolaXG(carteGiocate, stato.fenomeniAttivi, {
      malusBoss: stato.avversario.malusRegola !== undefined,
    });

    if (!giocata) {
      set({
        stato: 'PLAYER_ACTION',
        messaggio: 'Selezione non valida: gioca da 1 a 5 Convocati.',
      });
      return;
    }

    const manoResidua = stato.manoAttuale.filter((carta) => !selezionate.has(carta.id));
    const { mano, mazzo } = pescaFinoA(
      manoResidua,
      stato.mazzoRimanente,
      DIMENSIONE_MANO,
    );

    set({
      stato: 'RESOLUTION',
      manoAttuale: mano,
      mazzoRimanente: mazzo,
      selezionate: [],
      maniDisponibili: stato.maniDisponibili - 1,
      punteggioXG: stato.punteggioXG + giocata.xg,
      ultimaGiocata: giocata,
    });

    get().valutaRisultato();
  },

  valutaRisultato: () => {
    const stato = get();
    if (stato.stato !== 'RESOLUTION' || !stato.avversario) return;

    if (stato.punteggioXG >= stato.avversario.targetXG) {
      const interesse = Math.min(5, Math.floor(stato.quote / 5));
      const guadagno = 3 + stato.maniDisponibili + interesse;
      const nuoveQuote = stato.quote + guadagno;

      salvaQuote(nuoveQuote);

      set({
        stato: 'SHOP_PHASE',
        esito: 'VITTORIA',
        quote: nuoveQuote,
        ultimoGuadagno: guadagno,
        shopFenomeni: creaOfferteFenomeni(stato.fenomeniAttivi),
        shopPacchetti: creaOffertePacchetti(),
        messaggio: null,
      });
      return;
    }

    if (stato.maniDisponibili <= 0) {
      set({ stato: 'GAME_OVER', esito: 'SCONFITTA' });
      return;
    }

    set({ stato: 'PLAYER_ACTION' });
  },

  riordinaFenomeni: (activeId: string, overId: string) => {
    const stato = get();
    const da = stato.fenomeniAttivi.findIndex((fenomeno) => fenomeno.id === activeId);
    const a = stato.fenomeniAttivi.findIndex((fenomeno) => fenomeno.id === overId);
    if (da < 0 || a < 0 || da === a) return;

    const fenomeni = [...stato.fenomeniAttivi];
    const [spostato] = fenomeni.splice(da, 1);
    fenomeni.splice(a, 0, spostato);

    salvaFenomeni(fenomeni);
    set({ fenomeniAttivi: fenomeni, messaggio: null });
  },

  riordinaMano: (activeId: string, overId: string) => {
    const stato = get();
    if (stato.stato !== 'PLAYER_ACTION') return;

    const da = stato.manoAttuale.findIndex((carta) => carta.id === activeId);
    const a = stato.manoAttuale.findIndex((carta) => carta.id === overId);
    if (da < 0 || a < 0 || da === a) return;

    const mano = [...stato.manoAttuale];
    const [spostata] = mano.splice(da, 1);
    mano.splice(a, 0, spostata);

    set({ manoAttuale: mano });
  },

  acquistaFenomeno: (fenomenoId: string) => {
    const stato = get();
    const offerta = stato.shopFenomeni.find(
      (offertaCorrente) => offertaCorrente.fenomeno.id === fenomenoId,
    );

    if (!offerta) {
      set({ messaggio: 'Fenomeno non disponibile nel Bagagliaio.' });
      return;
    }

    if (stato.fenomeniAttivi.length >= MAX_FENOMENI) {
      set({ messaggio: 'Hai già 5 Fenomeni attivi: slot pieni.' });
      return;
    }

    if (stato.quote < offerta.costo) {
      set({ messaggio: 'Quote insufficienti per questo Fenomeno.' });
      return;
    }

    const fenomeni = [...stato.fenomeniAttivi, offerta.fenomeno];
    const quote = stato.quote - offerta.costo;

    salvaFenomeni(fenomeni);
    salvaQuote(quote);

    set({
      fenomeniAttivi: fenomeni,
      quote,
      shopFenomeni: stato.shopFenomeni.filter(
        (offertaCorrente) => offertaCorrente.fenomeno.id !== fenomenoId,
      ),
      messaggio: `${offerta.fenomeno.nome} è entrato a bordo campo.`,
    });
  },

  acquistaPacchetto: (pacchettoId: string) => {
    const stato = get();
    const pacchetto = stato.shopPacchetti.find(
      (pacchettoCorrente) => pacchettoCorrente.id === pacchettoId,
    );

    if (!pacchetto) {
      set({ messaggio: 'Pacchetto non disponibile nel Bagagliaio.' });
      return;
    }

    if (stato.quote < pacchetto.costo) {
      set({ messaggio: 'Quote insufficienti per questo Pacchetto.' });
      return;
    }

    const slotLiberi = MAX_FENOMENI - stato.fenomeniAttivi.length;
    if (slotLiberi <= 0) {
      set({ messaggio: 'Hai già 5 Fenomeni attivi: slot pieni.' });
      return;
    }

    const disponibili = mescola(
      CATALOGO_FENOMENI.filter(
        (fenomeno) => !stato.fenomeniAttivi.some((attivo) => attivo.id === fenomeno.id),
      ),
    ).slice(0, Math.min(pacchetto.fenomeniInclusi, slotLiberi));

    if (disponibili.length === 0) {
      set({ messaggio: 'Nessun Fenomeno disponibile da inserire nel Pacchetto.' });
      return;
    }

    const fenomeni = [...stato.fenomeniAttivi, ...disponibili];
    const quote = stato.quote - pacchetto.costo;

    salvaFenomeni(fenomeni);
    salvaQuote(quote);

    set({
      fenomeniAttivi: fenomeni,
      quote,
      shopPacchetti: stato.shopPacchetti.filter(
        (pacchettoCorrente) => pacchettoCorrente.id !== pacchettoId,
      ),
      messaggio: `${pacchetto.nome}: ${disponibili.length} Fenomeno/i acquisito/i.`,
    });
  },

  prossimoAvversario: () => {
    const stato = get();
    if (stato.stato !== 'SHOP_PHASE' || !stato.avversario) return;

    const bossBattuto = stato.avversario.tipo === 'BOSS';
    const mese = bossBattuto ? stato.mese + 1 : stato.mese;
    const targetBaseMese = bossBattuto
      ? stato.targetBaseMese * 2
      : stato.targetBaseMese;
    const indiceAvversario = bossBattuto ? 0 : stato.indiceAvversario + 1;

    set({
      ...statoPartitaIniziale(),
      stato: 'SELECT_OPPONENT',
      mese,
      targetBaseMese,
      indiceAvversario,
      avversariMese: creaAvversariMese(mese, targetBaseMese),
      mazzo: [],
      mazzoRimanente: [],
      manoAttuale: [],
      shopFenomeni: [],
      shopPacchetti: [],
    });
  },

  nuovaRun: () => {
    set({
      ...statoPartitaIniziale(),
      stato: 'SELECT_OPPONENT',
      mese: 1,
      targetBaseMese: TARGET_BASE_INIZIALE,
      indiceAvversario: 0,
      avversariMese: creaAvversariMese(1, TARGET_BASE_INIZIALE),
      mazzo: [],
      mazzoRimanente: [],
      manoAttuale: [],
      shopFenomeni: [],
      shopPacchetti: [],
    });
  },

  pulisciMessaggio: () => {
    set({ messaggio: null });
  },
}));
