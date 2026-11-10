import { create } from 'zustand';
import type { TutorialFase, TutorialStato } from '../../types';
import { useGameStore } from '../../store/useGameStore';
import { salvaTutorialCompletato } from '../../utils/storage';

/**
 * Mappatura fasi tutorial ↔ macchina a stati del game loop (data-model.md):
 * - fase 1 "La Mano" ↔ DRAW_PHASE
 * - fase 2 "Il Piazzamento" ↔ PLAYER_ACTION
 * - fase 3 "Risoluzione e xG" ↔ CALCULATION_PHASE / RESOLUTION
 * - fase 4 "Fine Turno" ↔ RESOLUTION (comportamento dell'Avversario)
 */

/** Convocato evidenziato nella fase "Il Piazzamento". */
export const CONVOCATO_TUTORIAL_ID = 'FUMATORI-14';

/**
 * Mazzo pre-ordinato del tutorial: la mano iniziale contiene Convocati
 * di valore alto, così il giocatore può leggere costo/effetto e completare
 * la fase di piazzamento senza frustrazione.
 */
export const MAZZO_TUTORIAL: string[] = [
  CONVOCATO_TUTORIAL_ID,
  'FUMATORI-13',
  'MARATONETI-14',
  'MARATONETI-12',
  'RISSOSI-14',
  'RISSOSI-11',
  'IMPROVVISATI-14',
  'IMPROVVISATI-10',
];

/** Avversario con parametri minimi per il tutorial (target xG basso). */
export const AVVERSARIO_TUTORIAL: TutorialStato['avversarioParametri'] = {
  id: 'tutorial-il-buio',
  nome: 'il Buio',
  targetXG: 50,
  tipo: 'BASE',
};

const ELEMENTO_TARGET: Record<TutorialFase, string> = {
  1: 'mano-convocati',
  2: CONVOCATO_TUTORIAL_ID,
  3: 'hud-xg',
  4: 'pulsante-fine-turno',
};

export interface TutorialStore extends TutorialStato {
  /** True mentre la partita tutorial guidata è in corso. */
  attivo: boolean;
  /** Avvia il tutorial e prepara la partita guidata nel game store. */
  avviaTutorial: () => void;
  /** Passa alla fase successiva, solo dopo l'azione richiesta. */
  completaFase: () => void;
  /** Chiude il tutorial e persiste il completamento. */
  completaTutorial: () => void;
  /** Interrompe il tutorial senza marcarlo come completato. */
  interrompiTutorial: () => void;
}

function faseSuccessiva(fase: TutorialFase): TutorialFase {
  if (fase >= 4) return 4;
  return (fase + 1) as TutorialFase;
}

export const useTutorialStore = create<TutorialStore>()((set, get) => ({
  attivo: false,
  faseAttiva: 1,
  completato: false,
  interazioniBloccate: false,
  elementoTarget: undefined,
  mazzoOrdinato: MAZZO_TUTORIAL,
  avversarioParametri: AVVERSARIO_TUTORIAL,

  avviaTutorial: () => {
    set({
      attivo: true,
      faseAttiva: 1,
      completato: false,
      interazioniBloccate: true,
      elementoTarget: ELEMENTO_TARGET[1],
    });

    // La partita guidata percorre INIT_MATCH → SELECT_OPPONENT → DRAW_PHASE
    // (fase 1) e prosegue su PLAYER_ACTION al passaggio di fase.
    useGameStore.getState().avviaPartitaTutorial(MAZZO_TUTORIAL, AVVERSARIO_TUTORIAL);
  },

  completaFase: () => {
    const fase = get().faseAttiva;
    if (fase >= 4) return;

    const prossima = faseSuccessiva(fase);
    set({
      faseAttiva: prossima,
      interazioniBloccate: true,
      elementoTarget: ELEMENTO_TARGET[prossima],
    });

    // La fase 1 si chiude solo dopo la lettura della mano: il game loop
    // prosegue da DRAW_PHASE a PLAYER_ACTION (fase 2, Il Piazzamento).
    if (fase === 1) {
      useGameStore.getState().entraInPiazzamento();
    }
  },

  completaTutorial: () => {
    set({
      attivo: false,
      completato: true,
      interazioniBloccate: false,
      elementoTarget: undefined,
    });
    salvaTutorialCompletato(true);
  },

  interrompiTutorial: () => {
    set({
      attivo: false,
      interazioniBloccate: false,
      elementoTarget: undefined,
    });
  },
}));
