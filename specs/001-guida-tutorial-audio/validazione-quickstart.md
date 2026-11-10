# Validazione Quickstart: Guida, Tutorial e Comparto Audio

**Feature**: `001-guida-tutorial-audio`
**Data**: 2026-11-10
**Riferimento**: `quickstart.md` (7 scenari)

Esiti della validazione eseguita a valle della fase di convergence (T028-T034).

## Comandi automatizzati

```
npx tsc --noEmit    # PASS — nessun errore di tipo
npm test -- --run   # PASS — 48 test / 7 file
npm run build       # PASS — bundle Vite prodotto
```

## Esiti per scenario

| # | Scenario | Metodo | Esito |
|---|----------|--------|-------|
| 1 | Aprire la Guida dal Menu Principale | Manuale (UI) | PASS |
| 2 | Guida dalla Pausa senza perdere i progressi | Manuale (UI) + verifica codice | PASS |
| 3 | Primo avvio e proposta del Tutorial | Automato (`storage.test.ts`, `TutorialFlusso.test.ts`) | PASS |
| 4 | Completare tutte e 4 le fasi del Tutorial | Automato (`TutorialFlusso.test.ts`) + manuale | PASS |
| 5 | Configurare e persistere le preferenze audio | Automato (`storage.test.ts`) + manuale | PASS |
| 6 | BGM non parte prima della prima interazione | Verifica codice (`AudioManager.tsx`) + manuale | PASS |
| 7 | Effetti sonori (SFX) | Automato (logica in `AudioManager`) + manuale | PASS |

## Dettaglio

### Scenario 1 — Guida dal Menu Principale
Il Menu Principale (`App.tsx`, schermata `menu`) espone il pulsante "Guida / Regole"
che apre `GuideModal` con tutte e quattro le sezioni (`regole-base`, `fasi-turno`,
`attitudini-ruoli`, `azioni`, ordine 0..3). La navigazione tra schede è gestita da
`GuideTabs` senza toccare lo stato di gioco.

### Scenario 2 — Guida dalla Pausa
Il Menu di Pausa espone lo stesso pulsante; `GuideModal` è una sovrimpressione
presentazionale: non invoca alcuna azione di `useGameStore`, quindi punteggio xG,
mano e turni restano intatti alla chiusura.

### Scenario 3 — Primo avvio
Il flag è persistito su `quota-campo:game-firstrun-v1` (alias legacy
`game.firstRun` riconosciuto e migrato). All'avvio, con `primoAvvio === true` e
tutorial non completato, `App.tsx` apre la proposta di Tutorial. Test:
`storage.test.ts` ("persiste il flag di primo avvio", "legge gli alias legacy…").

### Scenario 4 — Le 4 fasi del Tutorial
La partita guidata percorre la macchina a stati reale (Costituzione V):
`INIT_MATCH` (mazzo pre-ordinato, ≥ 5 Convocati ordinati) → `SELECT_OPPONENT`
(`il Buio`, target 50 xG) → `DRAW_PHASE` (fase 1 "La Mano", con dettaglio
valore/Tecnica/Attitudine/equipaggiamento di ogni Convocato e costo dichiarato
non modellato) → `PLAYER_ACTION` (fase 2 "Il Piazzamento", drag&drop del Convocato
target) → `CALCULATION_PHASE`/`RESOLUTION` (fase 3 "Risoluzione e xG") → fase 4
"Fine Turno" (comportamento dell'Avversario). Test: `TutorialFlusso.test.ts`.

### Scenario 5 — Preferenze audio
Pannello Impostazioni (`AudioSettingsPanel`) presente nel Menu Principale e in
Pausa, con toggle indipendenti persistiti su `quota-campo:audio-preferenze-v1`
(alias `audio.preferences`) e ripristinati dall'`useAudioStore` all'avvio. Test:
`storage.test.ts` ("salva e ricarica le preferenze audio…").

### Scenario 6 — Autoplay BGM
`AudioManager` avvia la BGM solo se `userInteracted === true` (catturato da
`onPointerDownCapture`/`onKeyDownCapture` in `App.tsx`); prima di allora
`stopBgm()` è attivo. Il file BGM è in `src/assets/audio/` (se assente, il
percorso di fallback mantiene il gioco avviabile senza audio).

### Scenario 7 — SFX
Eventi derivati dallo store in `AudioManager.tsx`:
- click di interfaccia su ogni `<button>`;
- "swoosh" alla pesca (mazzo rimanente in riduzione);
- "thud" a ogni piazzamento effettivo (nuova giocata, drag&drop incluso);
- fischio all'inizio partita (Avversario scelto, tutorial incluso) e a fine
  partita (Bagagliaio / Game Over);
- "goal" al superamento del target xG;
- "errore" per le mosse non valide (messaggi di errore del motore).
Con `sfxAttivi === false` nessun effetto è riprodotto.

## Criteri di superamento

- [x] Tutti gli scenari producono l'esito atteso.
- [x] Nessuna modifica allo stato di gioco durante apertura/chiusura della Guida.
- [x] Le preferenze audio sopravvivono al riavvio (LocalStorage, chiavi canoniche + alias).
- [x] La BGM non si avvia prima della prima interazione utente.
- [x] Terminologia di dominio conforme alla Costituzione (`Convocato`, `Attitudini`, `Avversario`/`il Buio`, `xG`).
