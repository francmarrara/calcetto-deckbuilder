import { describe, expect, it } from 'vitest';
import type { Attitudine, Convocato } from '../types';
import { valutaAzione } from './evaluator';

let contatore = 0;

function carta(valoreNominale: number, attitudine: Attitudine = 'FUMATORI'): Convocato {
  contatore += 1;
  return {
    id: `test-${contatore}`,
    valoreNominale,
    attitudine,
  };
}

describe('valutaAzione', () => {
  it('riconosce una singola carta come Azione Personale', () => {
    const azione = valutaAzione([carta(7)]);
    expect(azione?.tipo).toBe('AZIONE_PERSONALE');
    expect(azione?.tecnicaBase).toBe(5);
    expect(azione?.fomentoBase).toBe(1);
  });

  it('riconosce una coppia come Dai e Vai', () => {
    const azione = valutaAzione([carta(9, 'RISSOSI'), carta(9, 'MARATONETI')]);
    expect(azione?.tipo).toBe('DAI_E_VAI');
    expect(azione?.carte).toHaveLength(2);
    expect(azione?.tecnicaBase).toBe(10);
    expect(azione?.fomentoBase).toBe(2);
  });

  it('riconosce un tris come Triangolo', () => {
    const azione = valutaAzione([carta(12), carta(12, 'RISSOSI'), carta(12, 'MARATONETI')]);
    expect(azione?.tipo).toBe('TRIANGOLO');
  });

  it('riconosce una scala come Contropiede', () => {
    const azione = valutaAzione([
      carta(5),
      carta(6, 'RISSOSI'),
      carta(7, 'MARATONETI'),
      carta(8, 'IMPROVVISATI'),
      carta(9, 'FUMATORI'),
    ]);
    expect(azione?.tipo).toBe('CONTROPIEDE');
    expect(azione?.carte).toHaveLength(5);
  });

  it('riconosce un colore come Azione di Reparto', () => {
    const azione = valutaAzione([
      carta(3),
      carta(5),
      carta(7),
      carta(9),
      carta(11),
    ]);
    expect(azione?.tipo).toBe('AZIONE_DI_REPARTO');
  });

  it('riconosce un full come Schema su Punizione', () => {
    const azione = valutaAzione([
      carta(8),
      carta(8, 'RISSOSI'),
      carta(8, 'MARATONETI'),
      carta(4, 'IMPROVVISATI'),
      carta(4, 'FUMATORI'),
    ]);
    expect(azione?.tipo).toBe('SCHEMA_SU_PUNIZIONE');
    expect(azione?.carte).toHaveLength(5);
  });

  it('riconosce un poker come Torello', () => {
    const azione = valutaAzione([
      carta(10),
      carta(10, 'RISSOSI'),
      carta(10, 'MARATONETI'),
      carta(10, 'IMPROVVISATI'),
    ]);
    expect(azione?.tipo).toBe('TORELLO');
    expect(azione?.carte).toHaveLength(4);
  });

  it('riconosce una scala reale come Gol al Volo', () => {
    const azione = valutaAzione([
      carta(10),
      carta(11),
      carta(12),
      carta(13),
      carta(14),
    ]);
    expect(azione?.tipo).toBe('GOL_AL_VOLO');
  });

  it('ignora le carte fuori combo nel punteggio (es. doppia coppia con kicker)', () => {
    const azione = valutaAzione([
      carta(5),
      carta(5, 'RISSOSI'),
      carta(9, 'MARATONETI'),
      carta(9, 'IMPROVVISATI'),
      carta(13, 'FUMATORI'),
    ]);
    expect(azione?.tipo).toBe('TIKI_TAKA');
    expect(azione?.carte).toHaveLength(4);
  });

  it('restituisce null per una selezione vuota o troppo grande', () => {
    expect(valutaAzione([])).toBeNull();
    expect(
      valutaAzione(Array.from({ length: 6 }, () => carta(4))),
    ).toBeNull();
  });
});
