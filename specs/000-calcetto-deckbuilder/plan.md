# Implementation Plan: Quota Campo - Core Gameplay

**Branch**: `000-calcetto-deckbuilder` | **Date**: 2026-11-10 | **Spec**: specs/000-calcetto-deckbuilder/spec.md

**Input**: Feature specification from `/specs/000-calcetto-deckbuilder/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

Quota Campo is a turn-based roguelike deckbuilder for the browser. The player must reach a target xG (Gol Attesi) score by playing card combinations (Azioni) against a sequence of Avversari organized in Mesi. The core loop is: Select Avversario → Play Hand → Calculate xG → If target reached: Shop → Next Avversario. Game Over if hands run out before reaching the target.

Technical approach: Pure TypeScript calculation engine (evaluator + calculator pipeline) separated from React UI, Zustand state machine for game loop, LocalStorage for persistence, Vite + Tailwind for the SPA build. Folder architecture follows the user-provided development plan directory tree with strict Separation of Concerns (SoC).

## Technical Context

**Language/Version**: TypeScript 5.x (Strict Mode), React 18 (Functional Components + Hooks only)

**Primary Dependencies**: React, Zustand, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, Tailwind CSS, lucide-react, Vite

**Storage**: LocalStorage (Quote, Fenomeni acquired, progression across sessions per Constitution Principle II)

**Testing**: NEEDS CLARIFICATION (unit test framework for pure engine functions not specified in spec; constitution requires pure functions to enable future unit tests)

**Target Platform**: Web browser (static SPA, deployable to Vercel with zero config)

**Project Type**: web-application / single-page-application

**Performance Goals**: xG calculation and display in < 1 second (SC-002); full game completable in < 5 minutes (SC-001)

**Constraints**: TypeScript strict mode, no `any` type, all types in dedicated files, pure calculation functions independent of UI, domain nomenclature mandatory (xG, Tecnica, Fomento, Convocato, Azione, Fenomeno, Avversario, Quote, Bagagliaio, Attitudini), 52-card deck, max 5 Fenomeni slots, 4 Mani per partita, 3 Scarti per partita, 8-card hand size

**Scale/Scope**: 52-card standard deck, 9 Azione types, 4 Fenomeni for MVP, 3 Avversari per Mese, incremental xG targets (300 base / 450 medio / 600 alto for Mese 1, doubling after Boss)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate Evaluation

| Constitution Principle | Requirement | Plan Alignment | Status |
|---|---|---|---|
| I. Identità e Obiettivi | Deterministic browser engine, xG = Tecnica × Fomento pipeline | Pure engine (evaluator.ts + calculator.ts), SPA | PASS |
| II. Tech Stack | Vite, React functional/hooks, TS strict (no `any`), Tailwind, Zustand slices, @dnd-kit/core, pure calc functions | Plan specifies all | PASS |
| III. Nomenclatura Domain-Driven | xG, Tecnica, Fomento, Convocato, Attitudini (4 enum), Azione, Fenomeno (max 5), Avversario, Quote, Bagagliaio | Used throughout data model and engine | PASS |
| IV. Pipeline di Calcolo | 4-step order: Identificazione Azione → Valutazione Convocati → Trigger Modificatori Carta → Pipeline Fenomeni [0...n] | calculator.ts implements exact order | PASS |
| V. Macchina a Stati | Zustand state machine: INIT_MATCH, SELECT_OPPONENT, DRAW_PHASE, PLAYER_ACTION, CALCULATION_PHASE, RESOLUTION, SHOP_PHASE | State machine in useGameStore.ts | PASS |

**Gate Result**: ALL PASS — No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/000-calcetto-deckbuilder/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command) — NOT NEEDED (internal SPA)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
/
├── public/                 # Static assets (icons, backgrounds)
├── src/
│   ├── components/         # React components (UI)
│   │   ├── ui/             # Generic components (buttons, modals)
│   │   ├── game/           # Game components (Carta, SlotFenomeno, AreaDiGioco)
│   │   └── shop/           # Bagagliaio components
│   ├── engine/             # Pure logic (UI-independent calculation engine)
│   │   ├── evaluator.ts    # Action recognition (e.g., Contropiede, Dai e Vai)
│   │   └── calculator.ts   # Mathematical pipeline for xG (Tecnica × Fomento)
│   ├── store/              # Global state management
│   │   └── useGameStore.ts # Zustand store with Deck, GameLoop, Economy slices
│   ├── types/              # Strict TypeScript type definitions
│   │   └── index.ts        # All domain interfaces
│   ├── data/               # Static data
│   │   ├── baseDeck.ts     # 52-card standard deck generator
│   │   └── fenomeni.ts     # Fenomeni (Joker) catalog
│   ├── utils/              # Generic utility functions
│   ├── App.tsx             # Entry point and main layout (CSS Grid/Flexbox)
│   └── main.tsx            # React initialization
├── index.html
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # Strict mode enabled
└── package.json            # Dependencies: react, zustand, @dnd-kit/core, tailwindcss, etc.
```

**Structure Decision**: Single-project web application structure under `src/`, matching the user-provided development plan directory tree. No backend (SPA static, per Constitution Principle II).

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

No violations — Complexity Tracking not required.

---

## Phase 0: Outline & Research

All 5 clarifications from `/speckit.clarify` were resolved. No NEEDS CLARIFICATION markers remain in the spec except the testing framework choice (marked NEEDS CLARIFICATION in Technical Context above), which is resolved below.

### Research Decisions

**Decision**: Testing framework for pure engine functions → Vitest
**Rationale**: The constitution requires pure calculation functions to enable future unit tests. Vitest is the natural choice for a Vite + TypeScript project (zero-config, fast, TypeScript-native, same bundler as the app).
**Alternatives considered**: Jest (requires more configuration), Mocha + Chai (more boilerplate)

**Decision**: LocalStorage as sole persistence mechanism
**Rationale**: Constitution Principle II mandates LocalStorage for all saves, no backend/Node.js server.
**Alternatives considered**: IndexedDB (overkill for MVP), cookies (size limits), server-side DB (violates no-backend constraint)

**Decision**: Zustand with modular slices (GameState, DeckState, EconomyState)
**Rationale**: Constitution Principle II explicitly requires Zustand with slice-based modular state.
**Alternatives considered**: React Context + useReducer (less scalable for game state), Redux (overly complex for MVP)

**Decision**: @dnd-kit/core + @dnd-kit/sortable for drag & drop
**Rationale**: Constitution Principle II mandates @dnd-kit/core for hand and Fenomeno reordering.
**Alternatives considered**: HTML5 Drag and Drop API (inconsistent cross-browser), react-beautiful-dnd (deprecated)

**Output**: research.md (below) with all decisions documented — no remaining NEEDS CLARIFICATION

---

## Phase 1: Design & Contracts

### Data Model

See `data-model.md` (below) for all entities, fields, relationships, validation rules, and state transitions.

### Interface Contracts

The project is a client-side SPA with no external API interfaces (no backend per Constitution Principle II). Internal contracts:

1. **Engine contract** (`src/engine/`): `calcolaXG(convocati: Convocato[], fenomeni: Fenomeno[]): StatoCalcolo` — pure function, UI-independent.
2. **Store contract** (`src/store/useGameStore.ts`): Zustand store with typed actions (`pescaCarte`, `selezionaCarta`, `scartaSelezionate`, `giocaSelezionate`, `riordinaFenomeni`, `valutaRisultato`).
3. **State machine contract**: Transitions between `INIT_MATCH`, `SELECT_OPPONENT`, `DRAW_PHASE`, `PLAYER_ACTION`, `CALCULATION_PHASE`, `RESOLUTION`, `SHOP_PHASE`, `GAME_OVER`.

No `/contracts/` directory needed (project is purely internal/frontend).

### Quickstart Validation Guide

See `quickstart.md` (below) for runnable validation scenarios proving end-to-end functionality.

---

**Phase 1 complete. Design artifacts generated: research.md, data-model.md, quickstart.md. No contracts/ needed (internal SPA).**

Next command: `/speckit.tasks` to generate `tasks.md` for implementation.
