# Tasks: Guida, Tutorial e Comparto Audio

**Input**: Design documents from `/specs/001-guida-tutorial-audio/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification. The feature specification does not request automated test tasks, so none are generated here. Validation is via quickstart.md scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root (per plan.md Structure Decision)
- Paths assume single project structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per plan.md (mkdir src/components/guide, src/components/tutorial, src/components/audio)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Add domain types GuidaContenuto (id univoco richiesto, titolo non vuoto, ordine intero >= 0 univoco 0..3, quattro sezioni regole-base/fasi-turno/attitudini-ruoli/azioni tutte presenti), TutorialStato (faseAttiva 1..4, completato, interazioniBloccate, elementoTarget opzionale, mazzoOrdinato string[] >= 5, avversarioParametri object), PreferenzeAudio (musicaAttiva default true, sfxAttivi default true, toggle indipendenti), FlagPrimoAvvio (primoAvvio default true) to src/types/index.ts
- [x] T003 [P] Extend src/utils/storage.ts with caricaSalvaPreferenzeAudio (chiave quota-campo:audio-preferenze-v1), caricaSalvaFlagPrimoAvvio (chiave quota-campo:game-firstrun-v1), caricaSalvaTutorialCompletato (chiave quota-campo:tutorial-completato-v1), following the existing localStorageDisponibile() pattern
- [x] T004 [P] Create src/store/useAudioStore.ts Zustand slice: musicaAttiva, sfxAttivi, setMusicaAttiva, setSfxAttivi, persisted to LocalStorage
- [x] T005 [P] Create src/components/audio/useAudio.ts React hook: HTML5 Audio wrapper exposing playBgm (loop, only after userInteracted === true), stopBgm, playSfx(nome)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Consultare la Guida dal Menu Principale e dalla Pausa (Priority: P1) 🎯 MVP

**Goal**: Il giocatore può aprire una Guida (Regole) chiaramente posizionata dal Menu Principale e anche dal Menu di Pausa durante una partita in corso. La Guida si apre in una vista modale a schede (Tabs) con le sezioni Regole Base, Fasi del Turno, Attitudini e Ruoli, Azioni, senza perdere i progressi della partita in corso.

**Independent Test**: Può essere testato aprendo la Guida dal Menu Principale e, separatamente, aprendo una partita, mettendola in pausa e aprendo la Guida, cambiando scheda e chiudendola verificando che lo stato della partita sia intatto.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create src/components/guide/GuideContent.tsx: static testuale per le 4 sezioni (regole-base, fasi-turno, attitudini-ruoli, azioni) con ordine 0..3, tutte e quattro le sezioni presenti per rispettare la validazione del data model
- [x] T007 [P] [US1] Create src/components/guide/GuideTabs.tsx: props sections, activeSectionId (default prima sezione), onSectionChange; navigazione tra schede senza perdere i progressi della partita
- [x] T008 [US1] Create src/components/guide/GuideModal.tsx: props isOpen, onClose, sections; vista modale a schermo intero o a schede per la Guida (FR-003)
- [x] T009 [US1] Add pulsante "Guida"/"Regole" chiaramente posizionato nell'area di navigazione del Menu Principale (App.tsx) e collega apertura/chiusura GuideModal (FR-001)
- [x] T010 [P] [US1] Add pulsante "Guida"/"Regole" nel Menu di Pausa (UI in partita, es. HUD) e collega apertura/chiusura GuideModal (FR-002)
- [x] T011 [US1] Assicurarsi che aprire e chiudere la Guida non resetti lo stato della partita in corso (punteggio xG, carte in mano, turni rimasti invariati) (FR-004)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Completare il Tutorial guidato al primo avvio (Priority: P2)

**Goal**: Un giocatore al primissimo avvio del gioco riceve la proposta di fare il Tutorial (tramite flag primo avvio in LocalStorage). Se accetta (o clicca "Gioca Tutorial" dal Menu Principale), viene avviata una partita guidata in 4 fasi scriptate: La Mano, Il Piazzamento drag&drop, Risoluzione e xG, Fine Turno, con interazioni bloccate e elemento target evidenziato.

**Independent Test**: Può essere testato simulando il primo avvio (flag LocalStorage resettato), accettando il tutorial e completando tutte e 4 le fasi scriptate fino al ritorno al Menu Principale o all'inizio di una partita libera.

### Implementation for User Story 2

- [x] T012 [P] [US2] Create src/components/tutorial/TutorialState.tsx: stato del tutorial con faseAttiva (1..4), completato, interazioniBloccate, elementoTarget, mazzoOrdinato, avversarioParametri; transizioni 1 -> 2 -> 3 -> 4 -> completato solo dopo azione richiesta nella fase corrente
- [x] T013 [P] [US2] Create src/components/tutorial/TutorialOverlay.tsx: overlay in sovrimpressione che blocca le interazioni non necessarie e illumina l'elemento UI target da cliccare/trascinare
- [x] T014 [P] [US2] Create src/components/tutorial/TutorialStep.tsx: contenuto per fase (1 La Mano con costo/effetto Convocati, 2 Piazzamento drag&drop, 3 Risoluzione xG in pausa, 4 Fine Turno comportamento Avversario)
- [x] T015 [US2] Configura mazzo del giocatore pre-ordinato (mazzoOrdinato >= 5 Convocati per buona mano iniziale) e Avversario (`il Buio`) con parametri minimi (targetXG basso) per garanzia di comprensione senza frustrazione (FR-012)
- [x] T016 [US2] Aggiungi controllo flag primo avvio (game.firstRun) e pulsante "Gioca Tutorial" nel Menu Principale (FR-009, FR-010); proposta di tutorial al primissimo avvio assoluto
- [x] T017 [US2] Integra tutorial con gli stati del game loop esistenti (INIT_MATCH mazzo pre-ordinato, SELECT_OPPONENT avversario parametri minimi, DRAW_PHASE/PLAYER_ACTION/CALCULATION_PHASE/RESOLuzione overlay per le 4 fasi)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Configurare e persistere le preferenze audio (Priority: P3)

**Goal**: Il giocatore può attivare/disattivare in modo indipendente Musica e SFX tramite un pannello Impostazioni presente sia nel Menu Principale che in Pausa. Le preferenze vengono salvate in LocalStorage e riapplicate al riavvio. La musica di sottofondo parte solo dopo la prima interazione utente.

**Independent Test**: Può essere testato aprendo il pannello Impostazioni, togglando Musica e SFX indipendentemente, chiudendo e riaprendo il gioco e verificando che le preferenze siano mantenute.

### Implementation for User Story 3

- [x] T018 [P] [US3] Create src/components/audio/AudioManager.tsx: gestisce BGM in loop (parte solo dopo prima interazione utente per rispettare autoplay policy browser), stopBgm, playSfx(nome); usa musicaAttiva/sfxAttivi da useAudioStore (FR-013)
- [x] T019 [P] [US3] Create src/components/audio/AudioSettingsPanel.tsx: pannello Impostazioni con toggle indipendenti Musica e SFX, presente in Menu Principale e Pausa (FR-017)
- [x] T020 [US3] Collega suono di click ai bottoni del menu (SFX interfaccia) (FR-014)
- [x] T021 [P] [US3] Collega suono "swoosh" alla pesca di Convocato e "click/thud" al posizionamento Convocato sul tavolo con drag&drop (FR-015)
- [x] T022 [P] [US3] Collega suoni di gameplay: fischio arbitro (inizio/fine partita), rumore rete/esultanza contenuta (goal / superamento xG), suono errore (mossa non valida) (FR-016)
- [x] T023 [US3] Persisti preferenze audio (musicaAttiva, sfxAttivi) in LocalStorage (chiave quota-campo:audio-preferenze-v1) e ripristinale al riavvio del gioco (FR-018)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T024 [P] Esegui validazione degli scenari di quickstart.md (tutti e 7 gli scenari)
- [x] T025 [P] Verifica coerenza terminologia (Convocato, Attitudini, Avversario/`il Buio`, xG) across i nuovi componenti, senza termini generici ("carta", "semi", "Boss") fuori dalla sezione Clarifications storica
- [x] T026 Code cleanup e refactoring tra i nuovi file (guide/, tutorial/, audio/, store/useAudioStore.ts)
- [x] T027 [P] Aggiorna documentazione (README / link documentazione feature)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed) or sequentially in priority order (P1 → P2 → P3)
  - Each user story is independently testable
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) Guida**: Can start after Foundational (Phase 2) - No dependencies on other stories. MVP scope.
- **User Story 2 (P2) Tutorial**: Can start after Foundational (Phase 2) - May use useAudioStore but independently testable
- **User Story 3 (P3) Audio**: Can start after Foundational (Phase 2) - Independently testable

### Within Each User Story

- Models (types) before services (store/hooks) - handled in Foundational phase
- Services before UI components
- Core implementation before integration with existing game loop
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] (T003, T004, T005) can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tasks marked [P] within a user story can run in parallel (different files)
- Different user stories can be worked on in parallel by different team members

### Parallel Example: User Story 1

```bash
# Launch GuideContent and GuideTabs together (independent new files):
Task: "Create src/components/guide/GuideContent.tsx"
Task: "Create src/components/guide/GuideTabs.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Guida)
4. **STOP and VALIDATE**: Test User Story 1 independently (apri Guida da Menu Principale e da Pausa, verifica stato partita intatto)
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
   - Developer A: User Story 1 (Guida)
   - Developer B: User Story 2 (Tutorial)
   - Developer C: User Story 3 (Audio)
3. Stories complete and integrate independently

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability (US1=P1 Guida, US2=P2 Tutorial, US3=P3 Audio)
- Setup/Foundational/Polish phases have NO story label
- Each user story should be independently completable and testable
- Audio uses native HTML5 Audio + custom useAudio hook (no howler.js/use-sound, per research decision)
- Store audio is a dedicated useAudioStore slice (not extending useGameStore, per research decision)
- Terminology must follow Costituzione: `Convocato`, `Attitudini`, `Avversario`/`il Buio`, `xG`
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Phase 7: Convergence

- [x] T028 CRITICAL: Integrare l'avvio e le transizioni del Tutorial con la macchina a stati esistente (`INIT_MATCH` → `SELECT_OPPONENT`/`DRAW_PHASE` → `PLAYER_ACTION` → `CALCULATION_PHASE` → `RESOLUTION`) invece di saltare direttamente a `PLAYER_ACTION`, mappando le 4 fasi come da data-model e includendo il fischio d'inizio per Constitution V, T017 (contradicts)
- [x] T029 Bloccare tutte le interazioni non necessarie durante il Tutorial usando `interazioniBloccate`, inclusi pulsante Pausa, navigazione e backdrop dell'overlay, lasciando interagibile solo l'elemento target per FR-011, T013 (partial)
- [x] T030 Allineare il contenuto della Guida ai meccanismi effettivamente implementati: rimuovere o implementare bonus/sinergie delle Attitudini, ruoli e sconfitta per economia attualmente non presenti nel motore, evitando affermazioni non supportate per FR-005, FR-007 (contradicts)
- [x] T031 Completare il piazzamento drag&drop sul tavolo per tutti i Convocati, non solo per il target del Tutorial, e riprodurre "click/thud" a ogni piazzamento effettivo per FR-015, T021 (partial)
- [x] T032 Mostrare nella fase 1 "La Mano" il dettaglio costo/effetto di ciascun Convocato evidenziato (valore nominale, Tecnica, Attitudine, equipaggiamento/effetto; esplicitare se il costo non è modellato) per T014, US2/AC2 (partial)
- [x] T033 Allineare le chiavi di persistenza documentate in quickstart/data-model (`game.firstRun`, `audio.preferences`, `tutorial.completed`) con quelle runtime oppure aggiungere alias/migrazione, così lo scenario 3 resta riproducibile per T024, quickstart scenario 3 (partial)
- [x] T034 Eseguire e documentare la validazione end-to-end dei 7 scenari quickstart (Guida da menu/pausa, primo avvio, 4 fasi Tutorial, persistenza audio, autoplay BGM, SFX) per T024 (partial)
