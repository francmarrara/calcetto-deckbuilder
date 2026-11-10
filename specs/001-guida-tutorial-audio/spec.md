# Feature Specification: Guida, Tutorial e Comparto Audio

**Feature Branch**: `[001-guida-tutorial-audio]`

**Created**: 2026-11-10

**Status**: Draft

**Input**: User description: "Ecco una bozza per il documento di specifica relativo alle nuove funzionalità. ... # Specifica: Guida, Tutorial e Comparto Audio ... (vedi bozza completa fornita dall'utente)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultare la Guida dal Menu Principale e dalla Pausa (Priority: P1)

Il giocatore può aprire una Guida (Regole) ben visibile dal Menu Principale e anche dal Menu di Pausa durante una partita in corso. La Guida si apre in una vista modale o a schede (Tabs) che permette di navigare tra gli argomenti (Regole Base, Fasi del Turno, `Attitudini` e Ruoli, Azioni) senza perdere i progressi della partita in corso. Al chiudere la Guida, il giocatore riprende esattamente da dove era rimasto.

**Why this priority**: La Guida è il punto di ingresso principale per far comprendere le regole al giocatore; senza di essa le meccaniche di base (xG, vittoria contro il `Avversario` (`il Buio`), sconfitte per economia/malus) restano opache e aumentano l'abbandono nelle prime partite.

**Independent Test**: Può essere testato aprendo la Guida dal Menu Principale e, separatamente, aprendo una partita, mettendola in pausa e aprendo la Guida, cambiando scheda e chiudendola verificando che lo stato della partita sia intatto.

**Acceptance Scenarios**:

1. **Given** il giocatore si trova nel Menu Principale, **When** clicca sul pulsante "Guida"/"Regole", **Then** si apre la vista modale della Guida con tutte e quattro le sezioni argomento disponibili.
2. **Given** una partita in corso, **When** il giocatore apre il Menu di Pausa e clicca su "Guida"/"Regole", **Then** la Guida si apre sovrimposta alla partita senza resetare i progressi in corso.
3. **Given** la Guida aperta, **When** il giocatore naviga tra le schede e poi chiude la Guida, **Then** la partita sottostante riprende nello stato esatto in cui è stata lasciata.

---

### User Story 2 - Completare il Tutorial guidato al primo avvio (Priority: P2)

Un giocatore al primissimo avvio del gioco riceve la proposta di fare il Tutorial (tramite un flag di primo avvio in LocalStorage). Se accetta (o clicca "Gioca Tutorial" dal Menu Principale), viene avviata una partita guidata in 4 fasi: (1) la mano e lettura costo/effetto delle `Convocati`, (2) piazzamento drag&drop di una `Convocato` specifica sul tavolo, (3) risoluzione con mostra di come la `Convocato` modifica il contatore xG, (4) fine turno e comportamento del `Avversario` (`il Buio`). Durante il tutorial le interazioni non necessarie sono bloccate e l'elemento UI da cliccare/trascinare è evidenziato. Il mazzo del giocatore è pre-ordinato per garantire una buona mano iniziale e il `Avversario` (`il Buio`) ha parametri minimi per garantire la comprensione senza frustrazione.

**Why this priority**: Il tutorial insegna "learning by doing" e riduce la curva di apprendimento; è la seconda esperienza più critica dopo la lettura delle regole, specialmente per giocatori non familiari con i deckbuilder.

**Independent Test**: Può essere testato simulando il primo avvio (flag LocalStorage resettato), accettando il tutorial e completando tutte e 4 le fasi scriptate fino al ritorno al Menu Principale o all'inizio di una partita libera.

**Acceptance Scenarios**:

1. **Given** il primissimo avvio del gioco (nessun flag di primo avvio in LocalStorage), **When** il gioco si avvia, **Then** viene proposta al giocatore l'opzione di fare il Tutorial.
2. **Given** il Tutorial avviato, **When** arriva la fase "La Mano", **Then** vengono evidenziate le `Convocati` in mano con indicazione di costo ed effetto e le altre interazioni sono bloccate.
3. **Given** la fase "Il Piazzamento", **When** il giocatore trascina la `Convocato` indicata sul tavolo, **Then** l'azione viene accettata e si passa alla fase successiva.
4. **Given** la fase "Risoluzione e xG", **When** la `Convocato` viene risolta, **Then** il gioco mostra in pausa come il contatore xG è stato modificato.
5. **Given** la fase "Fine Turno", **When** il giocatore conclude il turno, **Then** viene spiegato cosa fa il `Avversario` (`il Buio`) e il tutorial si completa.

---

### User Story 3 - Configurare e persistere le preferenze audio (Priority: P3)

Il giocatore può attivare/disattivare in modo indipendente Musica e SFX tramite un pannello Impostazioni presente sia nel Menu Principale che in Pausa. Le preferenze vengono salvate in LocalStorage e riapplicate al riavvio del gioco, quindi se il giocatore silencia il gioco, al successivo avvio rimane silenziato. La musica di sottofondo parte solo dopo la prima interazione dell'utente (rispetto delle autoplay policy dei browser).

**Why this priority**: Il comparto audio migliora il game feel ma deve rispettare le preferenze del giocatore e le policy dei browser; la persistenza evita di dover riconfigurare i suoni a ogni avvio.

**Independent Test**: Può essere testato aprendo il pannello Impostazioni, togglando Musica e SFX indipendentemente, chiudendo e riaprendo il gioco e verificando che le preferenze siano mantenute.

**Acceptance Scenarios**:

1. **Given** il giocatore nel Menu Principale, **When** apre Impostazioni e disattiva la Musica, **Then** la musica si interrompe e il toggle riflette lo stato disattivato.
2. **Given** Musica disattivata, **When** il giocatore chiude e riapre il gioco, **Then** al riavvio la musica rimane disattivata.
3. **Given** il gioco avviato senza interazione utente, **When** non è avvenuto alcun click, **Then** la musica di sottofondo non è in riproduzione.
4. **Given** il giocatore effettua il primo click (es. "Gioca"), **When** l'interazione avviene, **Then** la musica di sottofondo può iniziare la riproduzione in loop.

### Edge Cases

- Cosa succede se il giocatore apre la Guida durante il calcolo xG di un turno (UI bloccata)?
- Cosa succede se il Tutorial viene interrotto a metà (ricarica pagina, chiusura scheda) e il giocatore riprende il gioco?
- Cosa succede se i file audio non sono ancora caricati quando l'utente effettua il primo click?
- Come si comporta il gioco se LocalStorage non è disponibile o è pieno (persistenza preferenze audio e flag primo avvio)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Guida"/"Regole" button clearly placed in the Main Menu navigation area, labeled "Guida"/"Regole".
- **FR-002**: System MUST provide a "Guida"/"Regole" button clearly placed in the Pause Menu during a match, labeled "Guida"/"Regole".
- **FR-003**: System MUST display the Guide as a modal/full-screen tabbed view with sections for Regole Base, Fasi del Turno, `Attitudini` e Ruoli, and Azioni.
- **FR-004**: System MUST open the Guide without interrupting or resetting an in-progress match, and must restore the match state exactly when closed.
- **FR-005**: System MUST include Guide content explaining how to win (accumulate xG, beat the `Avversario` (`il Buio`)) and how to lose (economy, malus).
- **FR-006**: System MUST include Guide content explaining the turn phases (Pesca, Giocata, Calcolo xG, Fine Turno).
- **FR-007**: System MUST list the card `Attitudini` (semi; mappati dai ruoli di esempio Portiere, Difensore, Centrocampista, Attaccante, Allenatore/Imprevisto) con le relative icone e spiegare i loro bonus/malus intrinseci o sinergie.
- **FR-008**: System MUST include Guide content explaining how card keywords/special actions work.
- **FR-009**: System MUST provide a "Gioca Tutorial" button in the Main Menu.
- **FR-010**: System MUST offer the Tutorial on the first-ever launch based on a first-run flag stored in LocalStorage.
- **FR-011**: System MUST guide the player through four scripted tutorial phases (La Mano, Il Piazzamento drag&drop, Risoluzione e xG, Fine Turno), blocking unnecessary interactions and highlighting the target UI element.
- **FR-012**: System MUST use a pre-set tutorial match (ordered player deck for a good starting hand, minimal `Avversario` (`il Buio`) parameters) so the player can learn without frustration.
- **FR-013**: System MUST play a looping background music track only after the user's first interaction with the screen (browser autoplay policy).
- **FR-014**: System MUST play sound effects for menu button clicks.
- **FR-015**: System MUST play card sound effects ("swoosh" on card draw, "click/thud" when a card is placed on the table via drag&drop).
- **FR-016**: System MUST play gameplay sounds (referee whistle at match start/end, net/celebration when a goal is scored or xG threshold is exceeded, error sound for an invalid move).
- **FR-017**: System MUST provide an audio settings panel (in Main Menu and Pause) with independent toggles for Music and SFX.
- **FR-018**: System MUST persist audio preferences (Music on/off, SFX on/off) in LocalStorage so they survive a game restart.

### Key Entities *(include if feature involves data)*

- **Guida**: raccolta di contenuti organizzata per sezioni argomento (Regole Base, Fasi del Turno, `Attitudini` e Ruoli, Azioni), fruibile in modalità modale o a schede.
- **Tutorial**: partita guidata in 4 fasi scriptate, attivata dal primo avvio o da pulsante dedicato, con mazzo pre-ordinato e `Avversario` (`il Buio`) dai parametri minimi.
- **Preferenze Audio**: coppia di stati (Musica attiva/disattiva, SFX attivi/disattivi) gestiti in modo indipendente e persistenti in LocalStorage.
- **Flag primo avvio**: indicatore in LocalStorage che segnala se il gioco è già stato avviato almeno una volta, usato per proporre il Tutorial.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un nuovo giocatore può aprire la Guida dal Menu Principale e leggere tutte e quattro le sezioni argomento senza assistenza esterna.
- **SC-002**: Un giocatore al primo avvio può completare tutte e quattro le fasi del Tutorial e avviare una partita normale senza frustrazione.
- **SC-003**: Un giocatore può attivare/disattivare Musica e SFX in modo indipendente e le scelte vengono mantenute al riavvio del gioco.
- **SC-004**: La musica di sottofondo non viene mai riprodotta prima della prima interazione dell'utente con il gioco.
- **SC-005**: Aprire e chiudere la Guida durante una partita non altera lo stato né i progressi della partita in corso.

## Assumptions

- I file audio effettivi (traccia BGM ed effetti sonori) sono forniti/aggiunti separatamente e sono fuori dallo scopo di questa specifica.
- Il Tutorial riutilizza il motore di gioco esistente e il flusso di partita (calcolo xG vs target del `Avversario` (`il Buio`)).
- Il flag di primo avvio e le preferenze audio sono memorizzati in LocalStorage insieme agli altri dati di salvataggio del gioco.
- Il pannello Impostazioni audio riutilizza gli stessi pattern di stile dei menu esistenti.
- La Guida è contenuto testuale statico; non richiede collegamenti a risorse esterne.

## Clarifications

### Session 2026-11-10

- Q: Dovrebbero la Guida e il Tutorial usare esclusivamente i termini di dominio obbligatori della Costituzione (es. `Convocato` invece di "carta", `Attitudini` invece di "semi", `Avversario`/`il Buio` invece di "Boss"), oppure possono mantenere i termini generici attuali? → A: Usare esclusivamente i termini di dominio della Costituzione in spec e UI (Opzione A).
