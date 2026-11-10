# Quota Campo

Deckbuilder roguelike per browser a tema calcetto amatoriale del giovedì sera. Il giocatore
deve raggiungere un target di **xG (Gol Attesi)** giocando combinazioni di **Convocati**,
sconfiggendo una serie di **Avversari** organizzati in **Mesi** e spendendo le **Quote** nel
**Bagagliaio**.

Documentazione di riferimento:

- Specifica: [`specs/000-calcetto-deckbuilder/spec.md`](specs/000-calcetto-deckbuilder/spec.md)
- Piano tecnico: [`specs/000-calcetto-deckbuilder/plan.md`](specs/000-calcetto-deckbuilder/plan.md)
- Modello dati: [`specs/000-calcetto-deckbuilder/data-model.md`](specs/000-calcetto-deckbuilder/data-model.md)
- Guida di validazione: [`specs/000-calcetto-deckbuilder/quickstart.md`](specs/000-calcetto-deckbuilder/quickstart.md)
- Costituzione: [`.specify/memory/constitution.md`](.specify/memory/constitution.md)

## Stack

- Vite + React 18 (solo Functional Components e Hooks)
- TypeScript in Strict Mode, nessun `any`
- Tailwind CSS (utility-first)
- Zustand con slice `GameState` / `DeckState` / `EconomyState`
- `@dnd-kit/core` + `@dnd-kit/sortable` per riordinare i Fenomeni
- Vitest per i test delle funzioni pure
- LocalStorage come unica persistenza (nessun backend)

## Comandi

```bash
npm install     # installa le dipendenze
npm run dev     # dev server Vite
npm run build   # type-check + build statica in dist/
npm run preview # anteprima della build
npm test        # test unitari (Vitest)
```

## Struttura

```text
src/
├── components/
│   ├── game/       Carta, HUD, AreaDiGioco, Tavolo, FenomeniBoard, ...
│   ├── shop/       Bagagliaio, ShopItem
│   └── ui/         Button
├── data/           mazzo base, catalogo Fenomeni, Pacchetti, Avversari
├── engine/         evaluator.ts + calculator.ts (puri, UI-independent)
├── store/          useGameStore.ts (macchina a stati + slice)
├── types/          tutti i tipi di dominio
├── utils/          persistenza, random, classi
├── App.tsx         layout principale
└── main.tsx        bootstrap React
```

## Regole implementate

- Mazzo standard di 52 Convocati (13 valori × 4 Attitudini), rimescolato a ogni partita.
- Mano di 8 carte, 4 Mani e 3 Scarti per partita.
- 9 Azioni riconosciute con i rispettivi valori base di Tecnica e Fomento
  (`src/engine/evaluator.ts`).
- Pipeline xG nell'ordine costituzionale: identificazione Azione → valutazione Convocati →
  modificatori carta → Fenomeni da sinistra a destra; infine `xG = Tecnica × Fomento`.
- Massimo 5 Fenomeni attivi, riordinabili via drag & drop: l'ordine cambia il risultato.
- Malus fisso dei Boss: il `Dai e Vai` vede azzerati Tecnica e Fomento base.
- Economia: +3 Quote per Avversario battuto, +1 per Mano non usata, +1 interesse ogni 5 Quote
  possedute (max +5).
- Dopo il Boss il Mese avanza e il target base raddoppia.
- Quote e Fenomeni acquistati persistono in LocalStorage.

## Validazione

Le sette scenari di `quickstart.md` sono coperti da test automatici:

| Scenario quickstart | Copertura |
|---|---|
| 1. Partita completa e vittoria | `src/store/useGameStore.test.ts` |
| 2. Scarto e pesca | `src/store/useGameStore.test.ts` |
| 3. Game Over | `src/store/useGameStore.test.ts` |
| 4. Bagagliaio e acquisti | `src/store/useGameStore.test.ts` |
| 5. Ordine della pipeline | `src/engine/calculator.test.ts` |
| 6. Persistenza tra sessioni | `src/utils/storage.test.ts` |
| 7. Progressione Mese e target | `src/store/useGameStore.test.ts` |

Per una verifica manuale: `npm run dev`, poi seguire gli scenari di `quickstart.md`.
