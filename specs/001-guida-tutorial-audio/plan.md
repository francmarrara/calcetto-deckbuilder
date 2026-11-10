# Implementation Plan: Guida, Tutorial e Comparto Audio

**Branch**: `[001-guida-tutorial-audio]` | **Date**: 2026-11-10 | **Spec**: `specs/001-guida-tutorial-audio/spec.md`

**Input**: Feature specification from `/specs/001-guida-tutorial-audio/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

Aggiungere al gioco Quota Campo tre nuove funzionalità frontend: una Guida (Regole) accessibile da Menu Principale e Pausa, una Modalità Tutorial guidata in 4 fasi attivabile al primo avvio o da pulsante dedicato, e un Comparto Audio (BGM in loop + SFX) con pannello Impostazioni e persistenza delle preferenze in LocalStorage. Il tutto riutilizza il motore di gioco esistente (calcolo xG, state machine, Zustand) senza introducere backend.

## Technical Context

**Language/Version**: TypeScript 5.6.3 (Strict Mode, `any` vietato)

**Primary Dependencies**: React 18.3.1 (Functional Components + Hooks), Zustand 4.5.5 (stato modulare a slice), @dnd-kit/core 6.1.0 (drag&drop), Tailwind CSS 3.4.15 (styling), Vite 5.4.11 (build tool), Vitest 2.1.5 (test)

**Storage**: LocalStorage (tutti i salvataggi, inclusi flag primo avvio e preferenze audio)

**Testing**: Vitest

**Target Platform**: Browser (Single Page Application statica, deploy su Vercel)

**Project Type**: Web application (SPA)

**Performance Goals**: 60 fps per l'interfaccia; avvio BGM e SFX entro 200 ms dalla prima interazione utente (rispetto autoplay policy browser)

**Constraints**: Nessun backend/server Node.js; persistenza solo LocalStorage; nomenclatura di dominio obbligatoria (`Convocato`, `Attitudini`, `Avversario`/`il Buio`, `xG`); BGM solo dopo prima interazione utente (autoplay policy browser)

**Scale/Scope**: Giocatore singolo; ~5 schede Guida; 4 fasi Tutorial; ~10 SFX + 1 traccia BGM

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio Costituzione | Stato | Verifica |
|------------------------|-------|----------|
| I. Identità e obiettivi (motore deterministico, xG = Tecnica × Fomento) | PASS | Tutorial riutilizza motore esistente; nessun cambiamento al calcolo |
| II. Tech Stack (Vite/React+TS, SPA statica, LocalStorage, Zustand, @dnd-kit, Tailwind) | PASS | Tutte le dipendenze già presenti in package.json; nessun nuovo backend |
| III. Nomenclatura Domain-Driven | PASS | Spec normalizzata su `Convocato`, `Attitudini`, `Avversario`/`il Buio` (v. Clarifications) |
| IV. Pipeline di calcolo rigorosa | PASS | Invariata; tutorial la mostra senza modificarla |
| V. Macchina a stati del game loop | PASS | Tutorial si inserisce negli stati esistenti (es. PLAYER_ACTION, CALCULATION_PHASE) |

**Gate Result**: PASS — nessuna violazione da giustificare. Non serve sezione Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-guida-tutorial-audio/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Option 1: Single project (DEFAULT)
src/
├── components/
│   ├── guide/
│   │   ├── GuideModal.tsx
│   │   ├── GuideTabs.tsx
│   │   └── GuideContent.tsx
│   ├── tutorial/
│   │   ├── TutorialOverlay.tsx
│   │   ├── TutorialStep.tsx
│   │   └── TutorialState.tsx
│   ├── audio/
│   │   ├── AudioManager.tsx
│   │   ├── AudioSettingsPanel.tsx
│   │   └── useAudio.ts
│   └── game/            (esistente, riutilizzato)
├── store/
│   ├── useGameStore.ts  (esistente, non modificato per le preferenze audio)
│   └── useAudioStore.ts (nuovo, slice dedicato per musicaAttiva/sfxAttivi)
├── types/
│   └── index.ts         (esistente, esteso con tipi Guida/Tutorial/Audio)
├── utils/
│   └── storage.ts       (esistente, riutilizzato per LocalStorage)
└── assets/
    └── audio/           (BGM + SFX, forniti separatamente)

tests/
├── unit/
├── integration/
└── contract/
```

**Structure Decision**: Single project (DEFAULT). Tutte le risorse risiedono sotto `src/` nella root del repository SPA esistente; nessuna separazione frontend/backend.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Nessuna violazione: sezione non applicabile, omessa.
