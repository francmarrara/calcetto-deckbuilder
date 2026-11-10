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
- Feature Guida/Tutorial/Audio — specifica: [`specs/001-guida-tutorial-audio/spec.md`](specs/001-guida-tutorial-audio/spec.md)
- Feature Guida/Tutorial/Audio — piano: [`specs/001-guida-tutorial-audio/plan.md`](specs/001-guida-tutorial-audio/plan.md)
- Feature Guida/Tutorial/Audio — validazione: [`specs/001-guida-tutorial-audio/quickstart.md`](specs/001-guida-tutorial-audio/quickstart.md)
- Costituzione: [`.specify/memory/constitution.md`](.specify/memory/constitution.md)

## Stack

- Vite + React 18 (solo Functional Components e Hooks)
- TypeScript in Strict Mode, nessun `any`
- Tailwind CSS (utility-first)
- Zustand con slice `GameState` / `DeckState` / `EconomyState` + `useAudioStore`
- `@dnd-kit/core` + `@dnd-kit/sortable` per riordinare i Fenomeni e piazzare i Convocati
- API Audio native di HTML5 (BGM in loop + SFX), senza librerie esterne
- Tutorial guidato in 4 fasi con overlay custom (nessuna libreria di onboarding)
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
│   ├── guide/      GuideModal, GuideTabs, GuideContent
│   ├── tutorial/   TutorialState, TutorialOverlay, TutorialStep
│   ├── audio/      AudioManager, AudioSettingsPanel, useAudio
│   └── ui/         Button
├── data/           mazzo base, catalogo Fenomeni, Pacchetti, Avversari
├── engine/         evaluator.ts + calculator.ts (puri, UI-independent)
├── store/          useGameStore.ts, useAudioStore.ts (slice Zustand)
├── types/          tutti i tipi di dominio
├── utils/          persistenza, random, classi
├── assets/audio/   BGM e SFX (file forniti separatamente)
├── App.tsx         layout principale + Menu Principale/Pausa/Guida/Tutorial
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
- I Convocati in mano sono riordinabili via drag & drop e selezionabili con un clic.
- Malus fisso dei Boss: il `Dai e Vai` vede azzerati Tecnica e Fomento base.
- Economia: +3 Quote per Avversario battuto, +1 per Mano non usata, +1 interesse ogni 5 Quote
  possedute (max +5).
- Dopo il Boss il Mese avanza e il target base raddoppia.
- Quote e Fenomeni acquistati persistono in LocalStorage.

## Guida, Tutorial e Audio

- **Guida / Regole**: modale a schede con le sezioni Regole Base, Fasi del Turno,
  Attitudini e Ruoli, Azioni. È apribile dal Menu Principale e dal Menu di Pausa
  senza modificare lo stato della partita.
- **Tutorial**: proposta al primissimo avvio (flag `quota-campo:game-firstrun-v1`) e
  sempre avviabile da “Gioca Tutorial”. Quattro fasi scriptate (La Mano,
  Il Piazzamento, Risoluzione e xG, Fine Turno) con mazzo pre-ordinato e Avversario
  `il Buio` a target ridotto. Il completamento è persistito in
  `quota-campo:tutorial-completato-v1`.
- **Audio**: BGM in loop (solo dopo la prima interazione utente) e SFX per click,
  pesca, piazzamento, fischio arbitro, goal ed errore. I toggle Musica/SFX sono
  indipendenti e persistono in `quota-campo:audio-preferenze-v1`.
- I file audio sono forniti separatamente: se presenti in `src/assets/audio/`
  (es. `bgm.mp3`, `click.mp3`, `swoosh.mp3`, `thud.mp3`, `fischio.mp3`, `goal.mp3`,
  `errore.mp3`) vengono inclusi dalla build; in alternativa si usano i percorsi
  pubblici `/audio/bgm.mp3` e `/audio/sfx/*.mp3`.

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

Per la feature Guida/Tutorial/Audio:

| Verifica | Copertura |
|---|---|
| Preferenze audio, flag primo avvio e Tutorial completato | `src/utils/storage.test.ts` |
| Transizioni tutorial 1 → 2 → 3 → 4 → completato | `src/components/tutorial/TutorialState.test.ts` |
| Scenari end-to-end (Guida, Tutorial, Audio, BGM, SFX) | [`specs/001-guida-tutorial-audio/quickstart.md`](specs/001-guida-tutorial-audio/quickstart.md) |

Per una verifica manuale: `npm run dev`, poi seguire gli scenari dei file `quickstart.md`.
