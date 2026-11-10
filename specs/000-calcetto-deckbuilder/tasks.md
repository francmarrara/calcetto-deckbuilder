# Tasks: Quota Campo - Core Gameplay

**Input**: Design documents from `/specs/000-calcetto-deckbuilder/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: OPTIONAL - not explicitly requested in feature specification. Vitest setup included in Phase 1 as a tooling decision from research.md; no per-story test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths assume single project structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create Vite project (React + TypeScript) per implementation plan in `package.json`, `index.html`, `tsconfig.json`
- [x] T002 [P] Install dependencies: `react`, `zustand`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `tailwindcss`, `postcss`, `autoprefixer`, `lucide-react`, `vitest` in `package.json`
- [x] T003 [P] Configure Tailwind CSS in `tailwind.config.js` and enable TypeScript strict mode in `tsconfig.json`
- [x] T004 Clean Vite boilerplate files (`App.css`, etc.) and create folder structure per plan.md (`src/components/ui/`, `src/components/game/`, `src/components/shop/`, `src/engine/`, `src/store/`, `src/types/`, `src/data/`, `src/utils/`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create `src/types/index.ts` with all domain entities: `Attitudine` enum (`FUMATORI`, `RISSOSI`, `MARATONETI`, `IMPROVVISATI`), `AzioneType` enum (9 types with base Tecnica/Fomento values), `Convocato` interface (`id: string`, `valoreNominale: number` 2-14, `attitudine: Attitudine`, `equipaggiamento?: string`), `StatoCalcolo` interface (`tecnica: number`, `fomento: number`), `Fenomeno` interface (`applicaEffetto` pure function), `Avversario` interface, `Partita` interface, `Mese` interface, `Quote` interface, `Mazzo` interface — no `any` type anywhere
- [x] T006 [P] Create `src/data/baseDeck.ts` with function to generate standard 52-card deck (13 values × 4 Attitudini, `valoreNominale` 2-14)
- [x] T007 [P] Create `src/data/fenomeni.ts` with 4 MVP Fenomeni as pure `applicaEffetto` functions: Il Proprietario del Pallone (+4 Fomento), L'Ansioso (+15 Tecnica per carta IMPROVVISATI), Il Bomber (×2 Fomento se Coppia), L'Arbitro Fiscale (+20 Fomento se esattamente 3 carte)
- [x] T008 Create `src/engine/evaluator.ts` to recognize 9 Azione types (Azione Personale, Dai e Vai, Tiki-Taka, Triangolo, Contropiede, Azione di Reparto, Schema su Punizione, Torello, Gol al Volo) with base Tecnica and Fomento values per data-model.md table
- [x] T009 Create `src/engine/calculator.ts` implementing xG pipeline in exact 4-step order: (1) Identificazione Azione loads base Tecnica/Fomento, (2) Valutazione Convocati sums valoreNominale of combo cards only, (3) Trigger Modificatori Carta, (4) Pipeline Fenomeni iterated [0...n] left to right with additive Tecnica/Fomento and multiplicative Fomento on running total
- [x] T010 Create `src/store/useGameStore.ts` with Zustand store: GameState slice (state machine INIT_MATCH → SELECT_OPPONENT → DRAW_PHASE → PLAYER_ACTION → CALCULATION_PHASE → RESOLUTION → SHOP_PHASE → GAME_OVER), DeckState slice (mazzo, manoAttuale, mazzoRimanente), EconomyState slice (Quote), actions: `pescaCarte`, `selezionaCarta`, `scartaSelezionate`, `giocaSelezionate`, `riordinaFenomeni`, `valutaRisultato`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Giocare una partita contro un avversario (Priority: P1) 🎯 MVP

**Goal**: Il giocatore seleziona un Avversario, riceve una mano iniziale di 8 carte, ha 4 Mani e 3 Scarti disponibili, seleziona da 1 a 5 carte per formare un'Azione, gioca l'Azione e vede il punteggio xG calcolato. L'obiettivo è raggiungere o superare il target xG dell'Avversario prima di esaurire le Mani disponibili.

**Independent Test**: Può essere testato avviando una singola partita, giocando una o più Azioni e verificando che il punteggio xG si aggiorni correttamente e che la partita termini con vittoria o Game Over in base al target raggiunto.

### Implementation for User Story 1

- [x] T011 [P] [US1] Create `src/components/ui/Button.tsx` generic button component with Tailwind styling
- [x] T012 [P] [US1] Create `src/components/game/Carta.tsx` selectable card component (renders Convocato valore + attitudine, highlights on selection)
- [x] T013 [P] [US1] Create `src/components/game/HUD.tsx` score display component showing xG = Tecnica × Fomento in real time
- [x] T014 [P] [US1] Create `src/components/game/AreaDiGioco.tsx` play area component for displaying played Azione
- [x] T015 [US1] Create `src/App.tsx` main layout with CSS Grid/Flexbox: Top (Avversario + Fenomeni a bordo campo), Center (Punteggio xG + Azione), Bottom (Carte in mano + Bottoni Gioca/Scarta)
- [x] T016 [US1] Implement store actions `selezionaCarta(id)` (toggle selection) and `giocaSelezionate()` (invokes engine evaluator + calculator, updates punteggioXG, consumes 1 Mano, transitions to CALCULATION_PHASE) in `src/store/useGameStore.ts`
- [x] T017 [US1] Implement state machine transitions: SELECT_OPPONENT → DRAW_PHASE → PLAYER_ACTION → CALCULATION_PHASE → RESOLUTION in `src/store/useGameStore.ts`
- [x] T018 [US1] Implement RESOLUTION logic: victory when punteggioXG >= targetXG → transition to SHOP_PHASE; Game Over when maniDisponibili = 0 and punteggioXG < targetXG in `src/store/useGameStore.ts`
- [x] T019 [US1] Implement LocalStorage persistence for Quote and Fenomeni acquisiti across browser sessions in `src/store/useGameStore.ts` (per Constitution Principle II)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Gestire le carte in mano con scarti e pescate (Priority: P2)

**Goal**: Il giocatore può scartare fino a 5 carte dalla mano per pescarne di nuove, mantenendo sempre fino a 8 carte in mano finché il mazzo non si esaurisce.

**Independent Test**: Può essere testato effettuando uno scarto e verificando che le carte scartate lascino la mano, nuove carte entrino, e la dimensione della mano torni a 8 finché il mazzo ha carte.

### Implementation for User Story 2

- [x] T020 [P] [US2] Implement store action `scartaSelezionate()` (discard selected cards up to 5, consume 1 Scarto, refill hand from mazzoRimanente) in `src/store/useGameStore.ts`
- [x] T021 [P] [US2] Implement store action `pescaCarte()` (refill manoAttuale to 8 cards from mazzoRimanente, handle deck exhaustion) in `src/store/useGameStore.ts`
- [x] T022 [US2] Implement deck exhaustion handling: when mazzoRimanente is empty, hand does not refill and remains with remaining cards in `src/store/useGameStore.ts`
- [x] T023 [US2] Add discard button to `src/App.tsx` bottom bar and wire to store actions `scartaSelezionate` and `pescaCarte`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Accedere al negozio e acquistare potenziamenti (Priority: P3)

**Goal**: Dopo aver battuto un Avversario, il giocatore accede al Bagagliaio (Negozio), spende le Quote accumulate per acquistare Fenomeni o Pacchetti, e procede al prossimo Avversario.

**Independent Test**: Può essere testato vincendo una partita, aprendo il Bagagliaio, acquistando un elemento e verificando che le Quote diminuiscano e l'elemento sia disponibile per la prossima partita.

### Implementation for User Story 3

- [x] T024 [P] [US3] Create `src/components/shop/Bagagliaio.tsx` shop UI component displaying 2 random Fenomeni acquistabili and 2 Pacchetti
- [x] T025 [P] [US3] Create `src/components/shop/ShopItem.tsx` purchasable item component with cost display and purchase button
- [x] T026 [US3] Implement EconomyState slice: Quote tracking, spending (decrease on purchase), earning (+3 per Avversario beaten, +1 per unused Mano, +1 interest per 5 Quote max +5) in `src/store/useGameStore.ts`
- [x] T027 [US3] Implement Fenomeno acquisition logic: add purchased Fenomeno to fenomeniAttivi, enforce max 5 slots in `src/store/useGameStore.ts`
- [x] T028 [US3] Connect "Prossimo Mese" button: reset turn state, scale target xG (double targetBase after Boss defeat per clarification Q2), restart loop from SELECT_OPPONENT in `src/App.tsx` and `src/store/useGameStore.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T029 [P] Run quickstart.md validation scenarios end-to-end (Scenario 1-7) to verify all features work
- [x] T030 [P] Code cleanup and refactoring across all components, engine, and store
- [x] T031 [P] Documentation updates referencing plan.md, data-model.md, and quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - May integrate with US1 but independently testable
  - User Story 3 (P3): Can start after Foundational - May integrate with US1/US2 but independently testable
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### Within Each User Story

- Types and engine (Phase 2) before store actions
- Store actions before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] (T002, T003) can run in parallel
- All Foundational tasks marked [P] (T006, T007) can run in parallel
- All US1 UI component tasks marked [P] (T011, T012, T013, T014) can run in parallel
- All US2 tasks marked [P] (T020, T021) can run in parallel
- All US3 component tasks marked [P] (T024, T025) can run in parallel
- All Polish tasks marked [P] (T029, T030, T031) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all UI component tasks for User Story 1 together:
Task: "Create src/components/ui/Button.tsx"
Task: "Create src/components/game/Carta.tsx"
Task: "Create src/components/game/HUD.tsx"
Task: "Create src/components/game/AreaDiGioco.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently using quickstart.md Scenario 1
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (P1)
   - Developer B: User Story 2 (P2)
   - Developer C: User Story 3 (P3)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- All types in `src/types/index.ts`, no `any` type (Constitution Principle II)
- Calculation engine in `src/engine/` is pure and UI-independent (Constitution Principle IV)
- Domain nomenclature used throughout: xG, Tecnica, Fomento, Convocato, Azione, Fenomeno, Avversario, Quote, Bagagliaio, Attitudini
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently

---

## Phase 7: Convergence

- [ ] T032 CRITICAL: Implement drag & drop reordering of the Convocati in hand via `@dnd-kit` (`SortableContext` in `src/components/game/Tavolo.tsx` + `riordinaMano` store action in `src/store/useGameStore.ts`) per Constitution II (missing)
