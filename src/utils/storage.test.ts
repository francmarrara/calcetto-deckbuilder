import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CATALOGO_FENOMENI } from '../data/fenomeni';
import {
  caricaFenomeni,
  caricaFlagPrimoAvvio,
  caricaPreferenzeAudio,
  caricaQuote,
  caricaTutorialCompletato,
  salvaFenomeni,
  salvaFlagPrimoAvvio,
  salvaPreferenzeAudio,
  salvaQuote,
  salvaTutorialCompletato,
} from './storage';

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

  it('salva e ricarica le preferenze audio con toggle indipendenti', () => {
    expect(caricaPreferenzeAudio()).toEqual({ musicaAttiva: true, sfxAttivi: true });

    salvaPreferenzeAudio({ musicaAttiva: false, sfxAttivi: true });
    expect(caricaPreferenzeAudio()).toEqual({ musicaAttiva: false, sfxAttivi: true });

    salvaPreferenzeAudio({ musicaAttiva: false, sfxAttivi: false });
    expect(caricaPreferenzeAudio()).toEqual({ musicaAttiva: false, sfxAttivi: false });
  });

  it('usa i default audio se il salvataggio è corrotto', () => {
    memoria.set('quota-campo:audio-preferenze-v1', '{non-json');
    expect(caricaPreferenzeAudio()).toEqual({ musicaAttiva: true, sfxAttivi: true });
  });

  it('persiste il flag di primo avvio, default true', () => {
    expect(caricaFlagPrimoAvvio()).toBe(true);

    salvaFlagPrimoAvvio(false);
    expect(caricaFlagPrimoAvvio()).toBe(false);

    salvaFlagPrimoAvvio(true);
    expect(caricaFlagPrimoAvvio()).toBe(true);
  });

  it('persiste il completamento del Tutorial, default false', () => {
    expect(caricaTutorialCompletato()).toBe(false);

    salvaTutorialCompletato(true);
    expect(caricaTutorialCompletato()).toBe(true);
  });

  it('legge gli alias legacy documentati e li migra sulla chiave canonica', () => {
    memoria.set('game.firstRun', 'false');
    expect(caricaFlagPrimoAvvio()).toBe(false);
    expect(memoria.get('quota-campo:game-firstrun-v1')).toBe('false');

    memoria.clear();
    memoria.set('audio.preferences', JSON.stringify({ musicaAttiva: false, sfxAttivi: true }));
    expect(caricaPreferenzeAudio()).toEqual({ musicaAttiva: false, sfxAttivi: true });
    expect(memoria.get('quota-campo:audio-preferenze-v1')).toBe(
      JSON.stringify({ musicaAttiva: false, sfxAttivi: true }),
    );

    memoria.clear();
    memoria.set('tutorial.completed', 'true');
    expect(caricaTutorialCompletato()).toBe(true);
    expect(memoria.get('quota-campo:tutorial-completato-v1')).toBe('true');
  });

  it('la chiave canonica ha precedenza sull\'alias legacy', () => {
    memoria.set('game.firstRun', 'false');
    memoria.set('quota-campo:game-firstrun-v1', 'true');
    expect(caricaFlagPrimoAvvio()).toBe(true);
  });
});
