# Research Decisions: Quota Campo - Core Gameplay

**Feature**: 000-calcetto-deckbuilder  
**Date**: 2026-11-10  
**Purpose**: Consolidate research findings and resolve all NEEDS CLARIFICATION items from the plan's Technical Context.

---

## Decision 1: Testing Framework for Pure Engine Functions

**Decision**: Vitest

**Rationale**: The constitution requires pure calculation functions independent of the UI to enable future unit tests. Vitest is the natural choice for a Vite + TypeScript project — it is zero-config, fast, TypeScript-native, and uses the same bundler (Vite) as the application, ensuring consistent module resolution between source and tests.

**Alternatives considered**:
- **Jest**: Powerful but requires more configuration in a Vite project (transformers, module mapping).
- **Mocha + Chai**: More boilerplate, less integrated with the Vite ecosystem.

---

## Decision 2: Persistence Mechanism

**Decision**: LocalStorage (sole persistence mechanism)

**Rationale**: Constitution Principle II explicitly mandates: "Nessun backend o server Node.js. Tutti i salvataggi avverranno nel LocalStorage." All game state that must persist (Quote, Fenomeni acquired, progression across sessions) is stored in LocalStorage.

**Alternatives considered**:
- **IndexedDB**: Overkill for MVP-scale data (Quote counts, Fenomeni IDs).
- **Cookies**: Size limits (~4KB) insufficient for game state.
- **Server-side database**: Violates the no-backend constraint.

---

## Decision 3: State Management

**Decision**: Zustand with modular slices (GameState, DeckState, EconomyState)

**Rationale**: Constitution Principle II explicitly requires Zustand with slice-based modular state. The store will be split into slices matching the domain: game loop state, deck/mazzo state, and economy (Quote) state.

**Alternatives considered**:
- **React Context + useReducer**: Less scalable for the game state machine with multiple slices.
- **Redux**: Overly complex for an MVP with purely local state.

---

## Decision 4: Drag & Drop Library

**Decision**: @dnd-kit/core + @dnd-kit/sortable

**Rationale**: Constitution Principle II mandates @dnd-kit/core for reordering cards in hand and Fenomeni modifiers on the field. @dnd-kit/sortable extends this for the Fenomeni slot reordering use case.

**Alternatives considered**:
- **HTML5 Drag and Drop API**: Inconsistent cross-browser behavior, especially on mobile.
- **react-beautiful-dnd**: Deprecated, no longer maintained.

---

## Resolution Summary

All NEEDS CLARIFICATION items from the Technical Context have been resolved:

| Item | Resolution | Location |
|---|---|---|
| Testing framework | Vitest | This document (Decision 1) |
| Persistence mechanism | LocalStorage | This document (Decision 2) |
| State management | Zustand slices | This document (Decision 3) |
| Drag & drop library | @dnd-kit | This document (Decision 4) |

No remaining NEEDS CLARIFICATION markers. Ready for Phase 1 design.
