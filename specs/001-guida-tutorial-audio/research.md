# Research: Guida, Tutorial e Comparto Audio

**Feature**: `001-guida-tutorial-audio`
**Date**: 2026-11-10

## Decisione 1: Implementazione audio (BGM + SFX)

**Decision**: Usare le API Audio native di HTML5 (`HTMLAudioElement`) con un wrapper custom leggero (`useAudio` hook React) invece di librerie esterne (howler.js, use-sound).

**Rationale**:
- La Costituzione impone zero dipendenze non essenziali e uno stack vincolante (Vite/React/TS/Tailwind/Zustand/@dnd-kit). Aggiungere howler.js o use-sound sarebbe una dipendenza esterna non giustificata per un comparto audio semplice (1 traccia BGM in loop, ~10 SFX brevi).
- Le API Audio native coprono tutti i requisiti: loop della BGM, riproduzione simultanea di più SFX, controllo volume/mute indipendente per Musica e SFX, sospensione/ripresa rispettando l'autoplay policy del browser (BGM parte solo dopo prima interazione utente).
- Un wrapper custom incapsula la latenza e la gestione di più `Audio` istanze senza sovrapposizioni errate, mantenendo il codice dentro i confini del progetto.

**Alternatives considered**:
- **howler.js**: valida per gestione avanzata del suono, ma introduce una dipendenza esterna e aumenta il bundle; superflua per ~10 SFX e 1 BGM.
- **use-sound**: comodo per React, ma ugualmente una dipendenza esterna; il wrapper custom offre lo stesso livello di astrazione senza dipendenze.

## Decisione 2: Overlay guidato del Tutorial

**Decision**: Implementare l'overlay guidato con logica React custom (stato a step, elementi target evidenziati tramite CSS class/Tailwind, interazioni bloccate da un overlay modale) invece di una libreria di onboarding di terze parti.

**Rationale**:
- Il tutorial ha solo 4 fasi scriptate con target UI ben definiti (carte in mano, area tavolo, pulsante fine turno); una libreria di onboarding aggiungerebbe complessità e dipendenza per un flusso lineare e limitato.
- La logica custom si integra naturalmente con Zustand (stato tutorial) e @dnd-kit (drag&drop nella fase "Il Piazzamento"), permettendo di bloccare le interazioni non necessarie e di evidenziare l'elemento da cliccare/trascinare.
- Il controllo completo sull'overlay facilita il rispetto del requisito "bloccare le interazioni non necessarie" e il test indipendente di ogni fase.

**Alternatives considered**:
- **Libreria onboarding (es. react-joyride, shepherd)**: utile per tour complessi, ma eccessiva per 4 fasi scriptate; aggiunge dipendenza esterna non prevista dallo stack vincolante.

## Decisione 3: Store audio

**Decision**: Creare un nuovo slice Zustand `useAudioStore` per le preferenze audio (musicaAttiva, sfxAttivi) anziché estendere `useGameStore`.

**Rationale**:
- Le preferenze audio sono ortogonali allo stato di partita; un slice dedicato mantiene la separazione delle preoccupazioni prevista dalla Costituzione (stato modulare suddiviso in slice).
- La persistenza in LocalStorage è già gestita da `utils/storage.ts`; il slice audio riutilizza lo stesso meccanismo.
- Facilita il test indipendente delle preferenze audio senza impattare lo stato di gioco.

**Alternatives considered**:
- **Estendere `useGameStore`**: accoppierebbe preferenze audio e stato di partita, violando la modularità a slice richiesta dalla Costituzione.

## Decisione 4: Contenuti della Guida

**Decision**: Contenuti testuali statici, definiti come costanti/dati statici all'interno del componente Guida, senza risorse esterne né chiamate API.

**Rationale**:
- La spec Assumption dichiara esplicitamente che la Guida è contenuto testuale statico e non richiede collegamenti esterni.
- Si allinea con l'architettura SPA statica senza backend (tutto nel browser, zero chiamate di rete).
- Semplicizza test e manutenzione; i contenuti sono versionati insieme al codice.

**Alternatives considered**:
- **File JSON/Markdown esterni caricati a runtime**: non necessario per contenuti statici; aggiungerebbe complessità di caricamento e gestione errori senza beneficio.
