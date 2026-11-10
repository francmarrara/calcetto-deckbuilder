import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '../../store/useGameStore';
import { caricaTutorialCompletato, salvaTutorialCompletato } from '../../utils/storage';
import {
  AVVERSARIO_TUTORIAL,
  CONVOCATO_TUTORIAL_ID,
  MAZZO_TUTORIAL,
  useTutorialStore,
} from './TutorialState';

const memoria = new Map<string, string>();

function installaWindow(): void {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: (chiave: string): string | null => memoria.get(chiave) ?? null,
        setItem: (chiave: string, valore: string): void => {
          memoria.set(chiave, valore);
        },
      },
    },
  });
}

/**
 * Validazione end-to-end del flusso tutorial (quickstart.md, scenari 3 e 4):
 * primo avvio -> proposta -> 4 fasi scriptate -> completamento persistito.
 */
describe('flusso tutorial end-to-end', () => {
  beforeEach(() => {
    memoria.clear();
    installaWindow();

    // Simula il primissimo avvio: nessun tutorial completato in precedenza.
    salvaTutorialCompletato(false);
    useGameStore.setState({
      stato: 'INIT_MATCH',
      avversario: null,
      mazzo: [],
      mazzoRimanente: [],
      manoAttuale: [],
      selezionate: [],
      ultimaGiocata: null,
      punteggioXG: 0,
      esito: null,
      messaggio: null,
    });
    useTutorialStore.setState({
      attivo: false,
      faseAttiva: 1,
      completato: false,
      interazioniBloccate: true,
      elementoTarget: undefined,
      mazzoOrdinato: MAZZO_TUTORIAL,
      avversarioParametri: AVVERSARIO_TUTORIAL,
    });
  });

  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it('percorre la macchina a stati e le 4 fasi fino al completamento', () => {
    // Fase 1: la partita guidata percorre INIT_MATCH -> SELECT_OPPONENT ->
    // DRAW_PHASE con mazzo pre-ordinato e Avversario a parametri minimi.
    useTutorialStore.getState().avviaTutorial();

    expect(useGameStore.getState().stato).toBe('DRAW_PHASE');
    expect(useGameStore.getState().avversario?.targetXG).toBe(
      AVVERSARIO_TUTORIAL.targetXG,
    );
    expect(useGameStore.getState().manoAttuale[0]?.id).toBe(CONVOCATO_TUTORIAL_ID);

    // Fase 1 -> 2: dopo la lettura della mano il game loop entra in
    // PLAYER_ACTION (Il Piazzamento).
    useTutorialStore.getState().completaFase();
    expect(useTutorialStore.getState().faseAttiva).toBe(2);
    expect(useGameStore.getState().stato).toBe('PLAYER_ACTION');

    // Fase 2: piazzamento del Convocato target (drag&drop o selezione) e
    // risoluzione attraverso CALCULATION_PHASE / RESOLUTION.
    useGameStore.getState().selezionaCarta(CONVOCATO_TUTORIAL_ID);
    useGameStore.getState().giocaSelezionate();

    const giocata = useGameStore.getState().ultimaGiocata;
    expect(giocata).not.toBeNull();
    expect(giocata?.azione.carte.some((c) => c.id === CONVOCATO_TUTORIAL_ID)).toBe(
      true,
    );
    expect(useGameStore.getState().punteggioXG).toBeGreaterThan(0);

    // Fase 3: il calcolo xG della giocata è visibile in sovrimpressione.
    useTutorialStore.getState().completaFase();
    expect(useTutorialStore.getState().faseAttiva).toBe(3);

    // Fase 4: Fine Turno, comportamento dell'Avversario (il Buio).
    useTutorialStore.getState().completaFase();
    expect(useTutorialStore.getState().faseAttiva).toBe(4);
    expect(useTutorialStore.getState().completato).toBe(false);

    // Completamento: il tutorial si chiude e resta memorizzato.
    useTutorialStore.getState().completaTutorial();
    expect(useTutorialStore.getState().attivo).toBe(false);
    expect(useTutorialStore.getState().completato).toBe(true);
    expect(useTutorialStore.getState().interazioniBloccate).toBe(false);
  });

  it('il completamento impedisce la riproponizione al prossimo avvio', () => {
    useTutorialStore.getState().avviaTutorial();
    useTutorialStore.getState().completaTutorial();

    // Il completamento persiste il flag: al prossimo avvio il modale di
    // benvenuto (primoAvvio && !tutorialCompletato) non viene riproposto.
    expect(caricaTutorialCompletato()).toBe(true);

    // Un avvio interrotto non tocca il flag di completamento persistito.
    useTutorialStore.getState().interrompiTutorial();
    expect(useTutorialStore.getState().attivo).toBe(false);
    expect(caricaTutorialCompletato()).toBe(true);
  });
});
