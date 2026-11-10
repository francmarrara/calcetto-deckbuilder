import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '../../store/useGameStore';
import {
  AVVERSARIO_TUTORIAL,
  MAZZO_TUTORIAL,
  useTutorialStore,
} from './TutorialState';

function statoInizialeTutorial(): void {
  useTutorialStore.setState({
    attivo: false,
    faseAttiva: 1,
    completato: false,
    interazioniBloccate: false,
    elementoTarget: undefined,
    mazzoOrdinato: MAZZO_TUTORIAL,
    avversarioParametri: AVVERSARIO_TUTORIAL,
  });
}

describe('stato del Tutorial', () => {
  beforeEach(statoInizialeTutorial);

  it('avvia una partita con mazzo pre-ordinato e Avversario con target minimo', () => {
    useTutorialStore.getState().avviaTutorial();

    const tutorial = useTutorialStore.getState();
    expect(tutorial.attivo).toBe(true);
    expect(tutorial.faseAttiva).toBe(1);
    expect(tutorial.interazioniBloccate).toBe(true);
    expect(tutorial.elementoTarget).toBe('mano-convocati');

    const partita = useGameStore.getState();
    // Il tutorial percorre la macchina a stati reale: INIT_MATCH ->
    // SELECT_OPPONENT -> DRAW_PHASE (fase 1), non un salto a PLAYER_ACTION.
    expect(partita.stato).toBe('DRAW_PHASE');
    expect(partita.avversario?.targetXG).toBe(AVVERSARIO_TUTORIAL.targetXG);
    expect(partita.manoAttuale).toHaveLength(8);
    expect(partita.manoAttuale[0]?.id).toBe(MAZZO_TUTORIAL[0]);
  });

  it('al passaggio di fase 1 -> 2 il game loop entra in PLAYER_ACTION', () => {
    useTutorialStore.getState().avviaTutorial();
    expect(useGameStore.getState().stato).toBe('DRAW_PHASE');

    useTutorialStore.getState().completaFase();
    expect(useTutorialStore.getState().faseAttiva).toBe(2);
    expect(useGameStore.getState().stato).toBe('PLAYER_ACTION');
  });

  it('transita solo in sequenza 1 -> 2 -> 3 -> 4 -> completato', () => {
    useTutorialStore.getState().avviaTutorial();

    useTutorialStore.getState().completaFase();
    expect(useTutorialStore.getState().faseAttiva).toBe(2);

    useTutorialStore.getState().completaFase();
    expect(useTutorialStore.getState().faseAttiva).toBe(3);

    useTutorialStore.getState().completaFase();
    expect(useTutorialStore.getState().faseAttiva).toBe(4);
    expect(useTutorialStore.getState().completato).toBe(false);

    useTutorialStore.getState().completaFase();
    expect(useTutorialStore.getState().faseAttiva).toBe(4);

    useTutorialStore.getState().completaTutorial();
    expect(useTutorialStore.getState().attivo).toBe(false);
    expect(useTutorialStore.getState().completato).toBe(true);
  });
});
