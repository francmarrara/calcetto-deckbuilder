# Feature Specification: Quota Campo - Core Gameplay

**Feature Branch**: `[000-calcetto-deckbuilder]`

**Created**: 2026-11-10

**Status**: Draft

**Input**: User description: "Quota Campo è un deckbuilder roguelike a turni. Il giocatore deve superare una serie di partite (Avversari) raggiungendo un punteggio target di xG (Gol Attesi) giocando combinazioni di carte dalla propria mano. Il loop di gioco è: Seleziona Avversario -> Gioca Mano -> Calcola xG -> Se target raggiunto: Negozio -> Prossimo Avversario. Se si finiscono le Mani disponibili senza raggiungere il target, è Game Over."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Giocare una partita contro un avversario (Priority: P1)

Il giocatore seleziona un Avversario, riceve una mano iniziale di 8 carte, ha 4 Mani e 3 Scarti disponibili, seleziona da 1 a 5 carte per formare un'Azione, gioca l'Azione e vede il punteggio xG calcolato. L'obiettivo è raggiungere o superare il target xG dell'Avversario prima di esaurire le Mani disponibili.

**Why this priority**: Questo è il loop di gioco primario e l'esperienza centrale del prodotto; senza di esso non esiste un MVP funzionante.

**Independent Test**: Può essere testato avviando una singola partita, giocando una o più Azioni e verificando che il punteggio xG si aggiorni correttamente e che la partita termini con vittoria o Game Over in base al target raggiunto.

**Acceptance Scenarios**:

1. **Given** una partita avviata contro un Avversario con target 300 xG, 4 Mani e 3 Scarti disponibili, **When** il giocatore gioca un'Azione valida, **Then** il punteggio xG calcolato viene sommato al totale della partita e una Mano è consumata.
2. **Given** una partita con target 300 xG e punteggio corrente 250 xG, **When** il giocatore gioca un'Azione che porta il totale a 320 xG, **Then** la partita si conclude con vittoria e il giocatore accede al Negozio.
3. **Given** una partita con target 300 xG e 0 Mani rimanenti, **When** il punteggio totale è 280 xG, **Then** la partita si conclude con Game Over.

---

### User Story 2 - Gestire le carte in mano con scarti e pescate (Priority: P2)

Il giocatore può scartare fino a 5 carte dalla mano per pescarne di nuove, mantenendo sempre fino a 8 carte in mano finché il mazzo non si esaurisce. Questo permette di cercare le carte necessarie per formare Azioni più potenti.

**Why this priority**: Senza la gestione dello scarto e della pesca, il giocatore non potrebbe migliorare la propria mano per raggiungere target xG più alti.

**Independent Test**: Può essere testato effettuando uno scarto e verificando che le carte scartate lascino la mano, nuove carte entrino, e la dimensione della mano torni a 8 finché il mazzo ha carte.

**Acceptance Scenarios**:

1. **Given** una mano di 8 carte, **When** il giocatore scarta 3 carte, **Then** la mano contiene 5 carte e 3 nuove carte vengono pescate dal mazzo per tornare a 8.
2. **Given** una mano di 8 carte, **When** il giocatore scarta 5 carte, **Then** 5 nuove carte vengono pescate per riportare la mano a 8 carte.
3. **Given** un mazzo esaurito e una mano di 6 carte, **When** il giocatore scarta 2 carte, **Then** la mano rimane a 4 carte (nessuna nuova carta pescata).

---

### User Story 3 - Accedere al negozio e acquistare potenziamenti (Priority: P3)

Dopo aver battuto un Avversario, il giocatore accede al Bagagliaio (Negozio), spende le Quote accumulate per acquistare Fenomeni o Pacchetti, e procede al prossimo Avversario.

**Why this priority**: Il negozio è il sistema di progressione a lungo termine, ma è secondario rispetto al loop di partita singolo per l'MVP.

**Independent Test**: Può essere testato vincendo una partita, aprendo il Bagagliaio, acquistando un elemento e verificando che le Quote diminuiscano e l'elemento sia disponibile per la prossima partita.

**Acceptance Scenarios**:

1. **Given** una partita vinta e 10 Quote disponibili, **When** il giocatore acquista un Fenomeno al costo di 6 Quote, **Then** le Quote residue sono 4 e il Fenomeno è equipaggiato a bordo campo.
2. **Given** un Avversario battuto, **When** il giocatore accede al Bagagliaio, **Then** sono disponibili 2 Fenomeni casuali e 2 Pacchetti acquistabili.

---

### Edge Cases

- Cosa succede quando il mazzo si esaurisce durante una partita e il giocatore deve pescare?
- Come si comporta il calcolo xG quando vengono giocate carte che non fanno parte attivamente della combo dell'Azione?
- Cosa accade quando il giocatore ha 0 Quote e accede al Bagagliaio?
- Come vengono gestiti i target xG quando il giocatore passa da un Mese all'altro dopo aver battuto il Boss?
- Cosa succede quando più Fenomeni attivi si applicano allo stesso calcolo xG in sequenza?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Il sistema MUST permettere al giocatore di selezionare un Avversario e visualizzare il target xG da raggiungere.
- **FR-002**: Il sistema MUST distribuire una mano iniziale di 8 carte dal mazzo standard di 52 carte all'inizio di ogni partita.
- **FR-003**: Il sistema MUST permettere al giocatore di selezionare da 1 a 5 carte per formare un'Azione e giocarla.
- **FR-004**: Il sistema MUST calcolare il punteggio xG totale come prodotto di Tecnica Totale per Fomento Totale, seguendo la pipeline di calcolo definita (identificazione Azione, valutazione Convocati, trigger modificatori carta, pipeline dei Fenomeni da sinistra a destra).
- **FR-005**: Il sistema MUST riconoscere le 9 tipologie di Azione valide (Azione Personale, Dai e Vai, Tiki-Taka, Triangolo, Contropiede, Azione di Reparto, Schema su Punizione, Torello, Gol al Volo) con i rispettivi valori base di Tecnica e Fomento.
- **FR-006**: Il sistema MUST sommare i valori nominali solo delle carte che compongono attivamente la combo dell'Azione; le carte giocate ma non parte della combo non contribuiscono al punteggio.
- **FR-007**: Il sistema MUST consentire al giocatore di scartare fino a 5 carte per turno e pescarne di nuove, mantenendo fino a 8 carte in mano finché il mazzo non si esaurisce.
- **FR-008**: Il sistema MUST tracciare le Mani disponibili (4 per partita) e consumarne una ogni volta che viene giocata un'Azione.
- **FR-009**: Il sistema MUST tracciare gli Scarti disponibili (3 per partita) e consumarne uno ogni volta che viene effettuato uno scarto.
- **FR-010**: Il sistema MUST dichiarare vittoria quando il punteggio xG raggiunto è uguale o superiore al target dell'Avversario.
- **FR-011**: Il sistema MUST dichiarare Game Over quando le Mani disponibili sono esaurite e il target xG non è stato raggiunto.
- **FR-012**: Il sistema MUST assegnare Quote al giocatore alla fine di una partita vinta, incluse Quote per avversario battuto, Mani non utilizzate e interessi sulle Quote possedute.
- **FR-013**: Il sistema MUST permettere l'acquisto di Fenomeni e Pacchetti nel Bagagliaio spendendo Quote, con un massimo di 5 slot Fenomeno attivi a bordo campo.
- **FR-014**: Il sistema MUST organizzare il gioco in Mesi, ciascuno con 3 Avversari e target xG incrementali (base, medio, alto), con il Boss del terzo Avversario che applica una regola Malus.
- **FR-015**: Il sistema MUST scalare il target base del Mese successivo dopo che il giocatore ha battuto il Boss del Mese corrente.

### Key Entities *(include if feature involves data)*

- **Convocato**: Singola carta da gioco con valore nominale (2-14) e un'Attitudine (FUMATORI, RISSOSI, MARATONETI, IMPROVVISATI).
- **Azione**: Combinazione di 1-5 carte giocata con un tipo riconosciuto, un valore base di Tecnica e un valore base di Fomento.
- **Fenomeno**: Modificatore passivo posizionato a bordo campo, valutato da sinistra a destra durante il calcolo xG, massimo 5 slot attivi contemporaneamente.
- **Avversario**: Team avversario con un target xG da superare e, per i Boss, una regola Malus opzionale.
- **Partita**: Singola sessione di gioco contro un Avversario con tracciamento di Mani, Scarti, carte in mano e punteggio xG accumulato.
- **Mese**: Blocco di 3 Avversari con target xG incrementali; dopo il Boss, il target base del Mese successivo scala.
- **Quote**: Moneta di gioco accumulata e spendibile nel Bagagliaio per acquistare Fenomeni e Pacchetti.
- **Mazzo**: Insieme di 52 carte standard da cui vengono pescati i Convocati durante le partite.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Il giocatore può completare una partita intera (dalla selezione dell'Avversario alla vittoria o al Game Over) in meno di 5 minuti.
- **SC-002**: Il calcolo del punteggio xG per un'Azione viene completato e visualizzato all'utente in meno di 1 secondo.
- **SC-003**: [Rimossa dai test di build - Spostata ai KPI di bilanciamento post-lancio] Il gioco dovrà permettere un win-rate del 70% tramite bilanciamento futuro dell'economia e degli xG.
- **SC-004**: Il sistema supporta lo svolgimento di almeno 10 partite consecutive (Mesi multipli) senza perdita di stato di progressione.
- **SC-005**: Il 90% degli utenti completa correttamente il tutorial implicito della prima partita (selezione Avversario, gioco di un'Azione, raggiungimento del target) senza intervento esterno.

## Assumptions

- I target xG esemplificativi (300 base, 450 medio, 600 alto) sono valori di partenza per il Mese 1; dopo aver battuto il Boss, il target base del Mese successivo raddoppia rispetto al Mese precedente (formula di scalaggio fissa, Opzione B).
- I prezzi di Fenomeni e Pacchetti nel Bagagliaio sono lasciati liberi da definire in un secondo momento (senza vincoli iniziali; verranno stabiliti in fase di design dell'economia) (Opzione B).
- Le Quote accumulate si accumulano tra partite, Mesi e sessioni del browser: Quote e Fenomeni acquistati persistono tramite LocalStorage anche dopo aver chiuso e riaperto la pagina (secondo il Principio II della costituzione).
- Il mazzo di 52 carte viene rimescolato all'inizio di ogni nuova partita (contro ogni singolo Avversario); ogni Avversario del Mese parte con un mazzo completo di 52 carte (Opzione A, raccomandata).
- La regola Malus del Boss è unica e fissa per tutti i Boss (es. "Dai e Vai" ha Tecnica e Fomento base azzerati); non varia tra Boss diversi (Opzione A, raccomandata).
- Gli interessi sulle Quote (+1 per ogni 5 possedute, max +5) si applicano al momento del calcolo delle Quote a fine partita.

## Clarifications

### Session 2026-11-10

- Q: Il progresso delle Quote e dei Fenomeni acquistati persiste tra sessioni del browser (chiudendo e riaprendo la pagina) o si resetta a ogni nuova sessione? → A: Persiste tra sessioni (LocalStorage): Quote e acquisti sono conservati dopo aver chiuso il browser (Opzione A, raccomandata).
- Q: Dopo aver battuto il Boss di un Mese, di quanto aumenta il target base del Mese successivo — esiste una formula di scalaggio fissa o viene definito caso per caso? → A: Formula di scalaggio fissa: il target base del Mese successivo raddoppia rispetto al Mese precedente (Opzione B, raccomandata).
- Q: Il mazzo di 52 carte viene rimescolato all'inizio di ogni partita (contro ogni Avversario), oppure solo una volta all'inizio di ogni Mese? → A: Rimescolato all'inizio di ogni partita contro ogni Avversario: mazzo completo di 52 carte per ciascun Avversario (Opzione A, raccomandata).
- Q: Ogni Boss del Mese applica una regola Malus unica e diversa, oppure tutti i Boss condividono la stessa regola Malus? → A: Un unico Malus fisso condiviso da tutti i Boss (es. "Dai e Vai" azzerato); non varia tra Boss diversi (Opzione A, raccomandata).
- Q: I prezzi di acquisto di Fenomeni e Pacchetti nel Bagagliaio devono seguire una scala predefinita o essere lasciati liberi? → A: Lasciati liberi da definire in un secondo momento, senza vincoli iniziali (Opzione B).
