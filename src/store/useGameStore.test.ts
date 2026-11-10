import { beforeEach, describe, expect, it } from 'vitest';
import { creaAvversariMese } from '../data/avversari';
import { useGameStore } from './useGameStore';

/** Riporta lo store a un Mese 1 pulito prima di ogni test. */
function reimpostaStore(): void {
  useGameStore.setState({
    stato: 'SELECT_OPPONENT',
    mese: 1,
    targetBaseMese: 300,
    indiceAvversario: 0,
    avversariMese: creaAvversariMese(1, 300),
    avversario: null,
    maniDisponibili: 4,
    scartiDisponibili: 3,
    punteggioXG: 0,
    selezionate: [],
    ultimaGiocata: null,
    esito: null,
    messaggio: null,
    ultimoGuadagno: 0,
    mazzo: [],
    mazzoRimanente: [],
    manoAttuale: [],
    quote: 0,
    fenomeniAttivi: [],
    shopFenomeni: [],
    shopPacchetti: [],
  });
}

function avviaPartita(): void {
  const stato = useGameStore.getState();
  stato.selezionaAvversario(stato.avversariMese[0].id);
}

describe('useGameStore — game loop', () => {
  beforeEach(() => {
    reimpostaStore();
  });

  it('parte dalla selezione Avversario e distribuisce 8 carte', () => {
    expect(useGameStore.getState().stato).toBe('SELECT_OPPONENT');

    avviaPartita();
    const stato = useGameStore.getState();

    expect(stato.stato).toBe('PLAYER_ACTION');
    expect(stato.manoAttuale).toHaveLength(8);
    expect(stato.maniDisponibili).toBe(4);
    expect(stato.scartiDisponibili).toBe(3);
    expect(stato.punteggioXG).toBe(0);
    expect(stato.mazzoRimanente).toHaveLength(44);
  });

  it('gioca un’Azione, consuma una Mano e aggiorna il punteggio xG', () => {
    avviaPartita();
    const prima = useGameStore.getState();
    const carta = prima.manoAttuale[0];

    prima.selezionaCarta(carta.id);
    useGameStore.getState().giocaSelezionate();

    const dopo = useGameStore.getState();
    expect(dopo.maniDisponibili).toBe(3);
    expect(dopo.punteggioXG).toBeGreaterThan(0);
    expect(dopo.ultimaGiocata?.xg).toBe(dopo.punteggioXG);
    expect(dopo.manoAttuale).toHaveLength(8);
    expect(dopo.selezionate).toHaveLength(0);
  });

  it('scarta le carte selezionate, ne pesca di nuove e consuma uno Scarto', () => {
    avviaPartita();
    const stato = useGameStore.getState();
    const selezionate = stato.manoAttuale.slice(0, 3);

    for (const carta of selezionate) {
      stato.selezionaCarta(carta.id);
    }
    useGameStore.getState().scartaSelezionate();

    const dopo = useGameStore.getState();
    expect(dopo.scartiDisponibili).toBe(2);
    expect(dopo.manoAttuale).toHaveLength(8);
    expect(dopo.mazzoRimanente).toHaveLength(41);
    expect(dopo.manoAttuale.some((carta) => selezionate.some((s) => s.id === carta.id))).toBe(
      false,
    );
  });

  it('a mazzo esaurito non rimpiazza le carte scartate', () => {
    avviaPartita();
    const stato = useGameStore.getState();
    const manoRidotta = stato.manoAttuale.slice(0, 6);

    useGameStore.setState({
      mazzoRimanente: [],
      manoAttuale: manoRidotta,
      selezionate: [],
    });

    const aggiornato = useGameStore.getState();
    aggiornato.selezionaCarta(manoRidotta[0].id);
    aggiornato.selezionaCarta(manoRidotta[1].id);
    useGameStore.getState().scartaSelezionate();

    expect(useGameStore.getState().manoAttuale).toHaveLength(4);
  });

  it('dichiara vittoria, premia le Quote e apre il Bagagliaio', () => {
    avviaPartita();
    const avversario = useGameStore.getState().avversario;
    expect(avversario).not.toBeNull();

    useGameStore.setState({ punteggioXG: (avversario?.targetXG ?? 0) - 1 });

    const stato = useGameStore.getState();
    stato.selezionaCarta(stato.manoAttuale[0].id);
    useGameStore.getState().giocaSelezionate();

    const dopo = useGameStore.getState();
    expect(dopo.stato).toBe('SHOP_PHASE');
    expect(dopo.esito).toBe('VITTORIA');
    // 3 per l'Avversario + 3 Mani residue + 0 interessi.
    expect(dopo.quote).toBe(6);
    expect(dopo.shopFenomeni).toHaveLength(2);
    expect(dopo.shopPacchetti).toHaveLength(2);
  });

  it('dichiara Game Over quando le Mani finiscono sotto target', () => {
    avviaPartita();
    useGameStore.setState({ maniDisponibili: 1, punteggioXG: 0 });

    const stato = useGameStore.getState();
    stato.selezionaCarta(stato.manoAttuale[0].id);
    useGameStore.getState().giocaSelezionate();

    const dopo = useGameStore.getState();
    expect(dopo.stato).toBe('GAME_OVER');
    expect(dopo.esito).toBe('SCONFITTA');
  });

  it('acquista un Fenomeno spendendo Quote e rispettando gli slot', () => {
    avviaPartita();
    const avversario = useGameStore.getState().avversario;
    useGameStore.setState({ punteggioXG: avversario?.targetXG ?? 0 });
    useGameStore.setState({ stato: 'RESOLUTION' });
    useGameStore.getState().valutaRisultato();

    const negozio = useGameStore.getState();
    const offerta = negozio.shopFenomeni[0];
    expect(offerta).toBeDefined();
    const quotePrima = negozio.quote;

    negozio.acquistaFenomeno(offerta.fenomeno.id);

    const dopo = useGameStore.getState();
    expect(dopo.fenomeniAttivi).toHaveLength(1);
    expect(dopo.quote).toBe(quotePrima - offerta.costo);
    expect(dopo.shopFenomeni.some((o) => o.fenomeno.id === offerta.fenomeno.id)).toBe(
      false,
    );
  });

  it('il riordino dei Fenomeni cambia l’ordine della pipeline', () => {
    const stato = useGameStore.getState();
    useGameStore.setState({
      fenomeniAttivi: [
        {
          id: 'a',
          nome: 'A',
          descrizione: 'A',
          applicaEffetto: (s) => s,
        },
        {
          id: 'b',
          nome: 'B',
          descrizione: 'B',
          applicaEffetto: (s) => s,
        },
      ],
    });

    stato.riordinaFenomeni('b', 'a');
    expect(useGameStore.getState().fenomeniAttivi.map((f) => f.id)).toEqual(['b', 'a']);
  });

  it('dopo il Boss scala il Mese e raddoppia il target base', () => {
    const boss = creaAvversariMese(1, 300)[2];
    useGameStore.setState({
      stato: 'SHOP_PHASE',
      avversario: boss,
      indiceAvversario: 2,
    });

    useGameStore.getState().prossimoAvversario();

    const dopo = useGameStore.getState();
    expect(dopo.stato).toBe('SELECT_OPPONENT');
    expect(dopo.mese).toBe(2);
    expect(dopo.targetBaseMese).toBe(600);
    expect(dopo.avversariMese[0].targetXG).toBe(600);
    expect(dopo.avversariMese[2].targetXG).toBe(1200);
  });
});
