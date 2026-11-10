import { describe, expect, it } from 'vitest';
import type { Attitudine, Convocato, Fenomeno } from '../types';
import { creaMazzoBase } from '../data/baseDeck';
import { CATALOGO_FENOMENI, fenomenoPerId } from '../data/fenomeni';
import { calcolaXG } from './calculator';

let contatore = 0;

function carta(valoreNominale: number, attitudine: Attitudine = 'FUMATORI'): Convocato {
  contatore += 1;
  return {
    id: `test-calc-${contatore}`,
    valoreNominale,
    attitudine,
  };
}

function fenomeno(id: string): Fenomeno {
  const trovato = fenomenoPerId(id);
  if (!trovato) throw new Error(`Fenomeno ${id} mancante dal catalogo`);
  return trovato;
}

describe('creaMazzoBase', () => {
  it('genera 52 Convocati con valori 2-14 per 4 Attitudini', () => {
    const mazzo = creaMazzoBase();
    expect(mazzo).toHaveLength(52);
    expect(new Set(mazzo.map((c) => c.attitudine)).size).toBe(4);
    expect(Math.min(...mazzo.map((c) => c.valoreNominale))).toBe(2);
    expect(Math.max(...mazzo.map((c) => c.valoreNominale))).toBe(14);
  });
});

describe('calcolaXG', () => {
  it('somma la Tecnica dei Convocati in combo alla base dell’Azione', () => {
    // Coppia di 5: base 10 Tecnica × 2 Fomento, +10 Tecnica dai Convocati.
    const risultato = calcolaXG([carta(5), carta(5, 'RISSOSI')], []);
    expect(risultato).not.toBeNull();
    expect(risultato?.statoCalcolo).toEqual({ tecnica: 20, fomento: 2 });
    expect(risultato?.xg).toBe(40);
  });

  it('applica i Fenomeni in ordine: somma prima della moltiplicazione', () => {
    const carte = [carta(5), carta(5, 'RISSOSI')];
    const proprietario = fenomeno('proprietario-del-pallone');
    const bomber = fenomeno('bomber');

    const sommaPoiMoltiplica = calcolaXG(carte, [proprietario, bomber]);
    expect(sommaPoiMoltiplica?.statoCalcolo.fomento).toBe(12);
    expect(sommaPoiMoltiplica?.xg).toBe(20 * 12);

    const moltiplicaPoiSomma = calcolaXG(carte, [bomber, proprietario]);
    expect(moltiplicaPoiSomma?.statoCalcolo.fomento).toBe(8);
    expect(moltiplicaPoiSomma?.xg).toBe(20 * 8);
  });

  it('Il Bomber moltiplica il Fomento solo in presenza di una coppia', () => {
    const bomber = fenomeno('bomber');
    const conCoppia = calcolaXG([carta(6), carta(6, 'MARATONETI')], [bomber]);
    expect(conCoppia?.statoCalcolo.fomento).toBe(4);

    const senzaCoppia = calcolaXG([carta(6), carta(9, 'MARATONETI')], [bomber]);
    expect(senzaCoppia?.azione.tipo).toBe('AZIONE_PERSONALE');
    expect(senzaCoppia?.statoCalcolo.fomento).toBe(1);
  });

  it('L’Ansioso aggiunge 15 Tecnica per ogni IMPROVVISATI giocato', () => {
    const ansioso = fenomeno('ansioso');
    const risultato = calcolaXG(
      [carta(7, 'IMPROVVISATI'), carta(9, 'IMPROVVISATI')],
      [ansioso],
    );
    // Fallback Azione Personale (carta alta 9): base 5 + 9 + 15*2 = 44 Tecnica.
    expect(risultato?.statoCalcolo.tecnica).toBe(44);
  });

  it('L’Arbitro Fiscale aggiunge 20 Fomento solo con esattamente 3 carte', () => {
    const arbitro = fenomeno('arbitro-fiscale');
    const tre = calcolaXG(
      [carta(4), carta(4, 'RISSOSI'), carta(4, 'MARATONETI')],
      [arbitro],
    );
    expect(tre?.statoCalcolo.fomento).toBe(23);

    const due = calcolaXG([carta(4), carta(4, 'RISSOSI')], [arbitro]);
    expect(due?.statoCalcolo.fomento).toBe(2);
  });

  it('applica il Malus Boss azzerando Tecnica e Fomento base', () => {
    const risultato = calcolaXG([carta(5), carta(5, 'RISSOSI')], [], {
      malusBoss: true,
    });
    // Base azzerata, restano solo i 10 punti Tecnica dei Convocati.
    expect(risultato?.statoCalcolo).toEqual({ tecnica: 10, fomento: 0 });
    expect(risultato?.xg).toBe(0);
  });

  it('il Malus Boss colpisce solo il Dai e Vai', () => {
    const risultato = calcolaXG(
      [carta(4), carta(4, 'RISSOSI'), carta(4, 'MARATONETI')],
      [],
      { malusBoss: true },
    );
    expect(risultato?.azione.tipo).toBe('TRIANGOLO');
    expect(risultato?.statoCalcolo).toEqual({ tecnica: 42, fomento: 3 });
  });

  it('restituisce null quando la selezione non è valida', () => {
    expect(calcolaXG([], [])).toBeNull();
  });

  it('il catalogo MVP contiene 4 Fenomeni', () => {
    expect(CATALOGO_FENOMENI).toHaveLength(4);
  });
});
