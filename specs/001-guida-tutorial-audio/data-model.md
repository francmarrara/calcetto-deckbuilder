# Data Model: Guida, Tutorial e Comparto Audio

**Feature**: `001-guida-tutorial-audio`
**Date**: 2026-11-10

## Entità

### GuidaContenuto

Raccolta di contenuti della Guida organizzata per sezioni argomento.

| Campo | Tipo | Vincoli | Descrizione |
|-------|------|---------|-------------|
| id | string | univoco, richiesto | Identificatore della sezione (es. `regole-base`, `fasi-turno`, `attitudini-ruoli`, `azioni`) |
| titolo | string | richiesto, non vuoto | Titolo della sezione visualizzato nella tab |
| contenuto | string | richiesto, non vuoto | Testo della sezione (markdown o testo semplice) |
| ordine | number | intero >= 0, univoco | Ordine di visualizzazione nelle tab |

**Validazione**: le quattro sezioni (`regole-base`, `fasi-turno`, `attitudini-ruoli`, `azioni`) devono essere tutte presenti; `ordine` deve coprire 0..3 senza buchi.

### TutorialStato

Stato della partita tutorial guidata.

| Campo | Tipo | Vincoli | Descrizione |
|-------|------|---------|-------------|
| faseAttiva | number | 1..4 | Indice della fase corrente (1: La Mano, 2: Il Piazzamento, 3: Risoluzione e xG, 4: Fine Turno) |
| completato | boolean | richiesto | Indica se il tutorial è stato completato |
| interazioniBloccate | boolean | richiesto | Quando `true`, le interazioni UI non necessarie sono bloccate |
| elementoTarget | string | opzionale | Identificatore dell'elemento UI da evidenziare/cliccare/trascinare nella fase corrente |
| mazzoOrdinato | string[] | richiesto, >= 5 carte | ID dei Convocati nel mazzo pre-ordinato per il tutorial |
| avversarioParametri | object | richiesto | Parametri minimi dell'`Avversario` (`il Buio`) per il tutorial (target xG basso) |

**Transizioni di stato**: `1 -> 2 -> 3 -> 4 -> completato`. Ogni transizione avviene solo dopo che il giocatore ha eseguito l'azione richiesta nella fase corrente.

### PreferenzeAudio

Preferenze audio del giocatore, persistenti.

| Campo | Tipo | Vincoli | Descrizione |
|-------|------|---------|-------------|
| musicaAttiva | boolean | richiesto, default `true` | Musica di sottofondo attiva/disattiva |
| sfxAttivi | boolean | richiesto, default `true` | Effetti sonori attivi/disattivi |

**Validazione**: i due toggle sono indipendenti; disattivare la musica non impatta gli SFX e viceversa.

### FlagPrimoAvvio

Indicatore di primo avvio assoluto del gioco.

| Campo | Tipo | Vincoli | Descrizione |
|-------|------|---------|-------------|
| primoAvvio | boolean | richiesto, default `true` | `true` se il gioco non è mai stato avviato prima |

## Relazioni

- `TutorialStato` referenzia `Avversario` (dominio esistente, `il Buio`) con parametri minimi per la fase 4.
- `TutorialStato.mazzoOrdinato` contiene ID di `Convocato` (dominio esistente).
- `PreferenzeAudio` è consultata da `AudioManager` per decidere se riprodurre BGM e SFX.
- `FlagPrimoAvvio` determina se proporre il Tutorial all'avvio (spec FR-010).
- La Guida è consultabile da Menu Principale e Pausa senza dipendere da `TutorialStato` o `PreferenzeAudio`.

## Persistenza (LocalStorage)

Tutte le entità sopra sono persistite in LocalStorage tramite `utils/storage.ts` (già esistente):

- `PreferenzeAudio` → chiave `quota-campo:audio-preferenze-v1` (alias legacy riconosciuto: `audio.preferences`)
- `FlagPrimoAvvio` → chiave `quota-campo:game-firstrun-v1` (alias legacy riconosciuto: `game.firstRun`)
- `TutorialStato.completato` → chiave `quota-campo:tutorial-completato-v1` (alias legacy riconosciuto: `tutorial.completed`), per non riproporre il tutorial già fatto

Le chiavi canoniche hanno precedenza; un valore presente solo su un alias legacy viene letto e migrato automaticamente sulla chiave canonica al primo caricamento.

## Integrazione con lo stato di gioco esistente

La macchina a stati del game loop (Costituzione, Sezione V) è invariata. Il tutorial si inserisce come sovrapposizione agli stati esistenti:

| Stato esistente | Coinvolgimento tutorial |
|-----------------|-------------------------|
| `INIT_MATCH` | Setup mazzo pre-ordinato se tutorial attivo |
| `SELECT_OPPONENT` | Avversario con parametri minimi se tutorial attivo |
| `DRAW_PHASE` | Fase 1 "La Mano": evidenzia Convocati in mano |
| `PLAYER_ACTION` | Fase 2 "Il Piazzamento": drag&drop della `Convocato` target |
| `CALCULATION_PHASE` | Fase 3 "Risoluzione e xG": mostra modifica contatore xG in pausa |
| `RESOLUTION` | Fase 4 "Fine Turno": spiega comportamento dell'`Avversario` |
