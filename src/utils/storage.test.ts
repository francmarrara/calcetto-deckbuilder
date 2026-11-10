import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CATALOGO_FENOMENI } from '../data/fenomeni';
import { caricaFenomeni, caricaQuote, salvaFenomeni, salvaQuote } from './storage';

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

describe('persistenza LocalStorage', () => {
  beforeEach(() => {
    memoria.clear();
    installaWindow();
  });

  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it('riparte da 0 quando non esiste alcun salvataggio', () => {
    expect(caricaQuote()).toBe(0);
    expect(caricaFenomeni()).toEqual([]);
  });

  it('salva e ricarica le Quote', () => {
    salvaQuote(12);
    expect(caricaQuote()).toBe(12);

    salvaQuote(-5);
    expect(caricaQuote()).toBe(0);
  });

  it('salva e ricarica i Fenomeni per id, senza duplicati', () => {
    const [primo, secondo] = CATALOGO_FENOMENI;
    salvaFenomeni([primo, secondo, primo]);

    const ricaricati = caricaFenomeni();
    expect(ricaricati.map((fenomeno) => fenomeno.id)).toEqual([primo.id, secondo.id]);
    expect(ricaricati[0].applicaEffetto).toBeTypeOf('function');
  });

  it('ignora salvataggi corrotti', () => {
    memoria.set('quota-campo:fenomeni-v1', '{non-json');
    expect(caricaFenomeni()).toEqual([]);

    memoria.set('quota-campo:quote-v1', 'abc');
    expect(caricaQuote()).toBe(0);
  });
});
