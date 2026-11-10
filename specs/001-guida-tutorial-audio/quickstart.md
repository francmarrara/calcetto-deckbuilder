# Quickstart: Guida, Tutorial e Comparto Audio

**Feature**: `001-guida-tutorial-audio`
**Date**: 2026-11-10

Questa guida documenta scenari di validazione eseguibili per dimostrare che la feature funziona end-to-end. Prerequisiti, comandi di setup, comandi di test ed esiti attesi sono elencati per scenario. I dettagli di implementazione appartengono a `tasks.md` e alla fase di implementazione.

## Prerequisiti

- Repository clonato e dipendenze installate (`npm install`).
- Ambiente di sviluppo avviato (`npm run dev`).
- Browser moderno con supporto Web Audio API e LocalStorage.
- File audio (BGM e SFX) presenti in `src/assets/audio/` (forniti separatamente, fuori scopo specifica).

---

## Scenario 1: Aprire la Guida dal Menu Principale

**Prerequisiti**: Nessuna partita in corso; gioco avviato nel Menu Principale.

**Comandi / Azioni**:
1. Avviare il gioco (`npm run dev`).
2. Cliccare sul pulsante "Guida"/"Regole" nel Menu Principale.

**Esito atteso**:
- Si apre la vista modale della Guida.
- Sono presenti tutte e quattro le sezioni argomento (Regole Base, Fasi del Turno, Attitudini e Ruoli, Azioni).
- Navigando tra le schede i contenuti cambiano correttamente.

---

## Scenario 2: Aprire la Guida dalla Pausa senza perdere i progressi

**Prerequisiti**: Partita in corso; Menu di Pausa aperto.

**Comandi / Azioni**:
1. Avviare una partita.
2. Aprire il Menu di Pausa e cliccare su "Guida"/"Regole".
3. Navigare tra le schede della Guida.
4. Chiudere la Guida.

**Esito atteso**:
- La Guida si apre sovrimposta alla partita senza resettare i progressi.
- Alla chiusura, la partita riprende nello stato esatto in cui è stata lasciata (punteggio xG, carte in mano, turni rimasti invariati).

---

## Scenario 3: Primo avvio e proposta del Tutorial

**Prerequisiti**: Flag primo avvio resettato (`localStorage.removeItem('quota-campo:game-firstrun-v1')`; anche l'alias legacy `game.firstRun` viene riconosciuto); nessun tutorial completato.

**Comandi / Azioni**:
1. Avviare il gioco simulando il primissimo avvio.
2. Osservare la schermata di benvenuto/home.

**Esito atteso**:
- Il gioco propone all'utente di fare il Tutorial (basato sul flag primo avvio in LocalStorage).
- Se l'utente accetta, si avvia la partita guidata in 4 fasi.

---

## Scenario 4: Completare tutte e 4 le fasi del Tutorial

**Prerequisiti**: Tutorial avviato.

**Comandi / Azioni**:
1. Fase 1 "La Mano": verificare che le `Convocati` in mano siano evidenziate con costo ed effetto; le altre interazioni sono bloccate.
2. Fase 2 "Il Piazzamento": trascinare la `Convocato` indicata sul tavolo; l'azione viene accettata e si passa alla fase successiva.
3. Fase 3 "Risoluzione e xG": il gioco mostra in pausa come il contatore xG è stato modificato.
4. Fase 4 "Fine Turno": viene spiegato cosa fa l'`Avversario` (`il Buio`); il tutorial si completa.

**Esito atteso**:
- Tutte e 4 le fasi si completano in sequenza senza frustrazione (mazzo pre-ordinato, `Avversario` parametri minimi).
- Al termine, il giocatore può avviare una partita normale.

---

## Scenario 5: Configurare e persistere le preferenze audio

**Prerequisiti**: Gioco avviato; pannello Impostazioni accessibile.

**Comandi / Azioni**:
1. Aprire Impostazioni dal Menu Principale (o dalla Pausa).
2. Disattivare Musica (toggle indipendente).
3. Disattivare SFX (toggle indipendente).
4. Chiudere e riaprire il gioco.

**Esito atteso**:
- Musica e SFX si interrompono immediatamente al toggle; i toggle riflettono lo stato disattivato.
- Al riavvio del gioco, le preferenze (musica disattiva, SFX disattivi) sono mantenute.
- I due toggle agiscono in modo indipendente (disattivare uno non impatta l'altro).

---

## Scenario 6: BGM non parte prima della prima interazione utente

**Prerequisiti**: Gioco appena avviato, nessuna interazione utente effettuata.

**Comandi / Azioni**:
1. Avviare il gioco senza effettuare alcun click.

**Esito atteso**:
- La musica di sottofondo non è in riproduzione.
- Dopo il primo click dell'utente (es. cliccare "Gioca"), la musica di sottofondo può iniziare la riproduzione in loop.

---

## Scenario 7: Effetti sonori (SFX)

**Prerequisiti**: SFX attivi; gioco in corso.

**Comandi / Azioni**:
1. Cliccare un bottone del menu → deve suonare il click di interfaccia.
2. Pescare una carta → deve suonare lo "swoosh".
3. Posizionare una carta sul tavolo (drag&drop) → deve suonare "click/thud".
4. Inizio/fine partita → fischio dell'arbitro.
5. Superare il target xG / segnare un goal → rumore della rete/esultanza.
6. Mossa non valida → suono di errore.

**Esito atteso**:
- Ogni azione produce il relativo effetto sonoro descritto nella spec (FR-014…FR-016).
- Con SFX disattivati, nessuno di questi suoni viene riprodotto.

---

## Esecuzione dei test automatizzati

Se presenti test di unità/integrazione per la feature:

```
npm test
```

**Esito atteso**: tutti i test passano; nessuna regressione sulle funzionalità esistenti (motore xG, state machine, salvataggio LocalStorage).

---

## Criteri di superamento (Definition of Done)

- Tutti gli scenari sopra producono l'esito atteso.
- Nessuna modifica allo stato di gioco esistente durante l'apertura/chiusura della Guida.
- Le preferenze audio sopravvivono al riavvio del browser.
- La BGM non si avvia prima della prima interazione utente.
- La terminologia di dominio rispetta la Costituzione (`Convocato`, `Attitudini`, `Avversario`/`il Buio`, `xG`).
