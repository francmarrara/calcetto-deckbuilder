import { describe, expect, it } from 'vitest';
import { GUIDE_SEZIONI } from './GuideContent';

describe('contenuto della Guida', () => {
  it('espone tutte e quattro le sezioni con ordine 0..3 senza buchi', () => {
    const ordini = GUIDE_SEZIONI.map((sezione) => sezione.ordine).sort((a, b) => a - b);
    expect(ordini).toEqual([0, 1, 2, 3]);

    const ids = GUIDE_SEZIONI.map((sezione) => sezione.id);
    expect(ids).toEqual(
      expect.arrayContaining(['regole-base', 'fasi-turno', 'attitudini-ruoli', 'azioni']),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('spiega vittoria, sconfitta, fasi del turno, Attitudini e Azioni', () => {
    const testo = GUIDE_SEZIONI.map((sezione) => sezione.contenuto).join('\n');

    expect(testo).toContain('xG');
    expect(testo).toContain('il Buio');
    expect(testo).toContain('Pesca');
    expect(testo).toContain('Attitudini');
    expect(testo).toContain('Azione');
  });
});
