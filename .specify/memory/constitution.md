<!-- Sync Impact Report
Version change: 1.0.0 -> 1.1.0 (MINOR: materially expanded Tech Stack principle with Build Tool/Deployment)
Modified principles: II. Tech Stack e Vincoli di Sviluppo (expanded with Build Tool e Deployment)
Added sections: none
Removed sections: none
Follow-up TODOs: none
-->

# Quota Campo Constitution

## Core Principles

### I. Identità e Obiettivi del Progetto
Quota Campo è un roguelike deckbuilder per browser ispirato a *Balatro*, a tema calcetto a 5 amatoriale del giovedì sera. Il motore di gioco deve essere deterministico, eseguito interamente nel browser, con il calcolo del punteggio implementato come pipeline matematica rigorosa e un'interfaccia che reagisce fluidamente agli stati di gioco. Il punteggio totale di una giocata è l'xG (Gol Attesi), definito come prodotto tra Tecnica Totale e Fomento Totale.

Rationale: garantisce prevedibilità del punteggio, ripetibilità per test e coerenza tematica tra dominio e interfaccia.

### II. Tech Stack e Vincoli di Sviluppo (Tassativi)
Il stack tecnologico è vincolante e non derogabile:
- Build Tool e Deployment: Vite (Template React + TS). Il progetto è una Single Page Application (SPA) statica, ottimizzata per il deploy immediato e zero-config su Vercel. Nessun backend o server Node.js. Tutti i salvataggi avvengono nel LocalStorage.
- Framework: React, esclusivamente Functional Components e Hooks.
- Linguaggio: TypeScript in Strict Mode. Il tipo `any` è severamente vietato; ogni tipo deve essere definito in file dedicati (es. `types/index.ts`).
- Styling: Tailwind CSS, utility-first.
- State Management: Zustand, stato modulare suddiviso in slice (es. `GameState`, `DeckState`, `EconomyState`).
- Interazioni Drag & Drop: `@dnd-kit/core` per il riordino delle carte in mano e dei modificatori a bordo campo.
- Separazione delle Preoccupazioni: la logica del motore di calcolo deve essere scritta tramite funzioni pure e indipendenti dalla UI, per consentire unit test futuri.

### III. Nomenclatura Domain-Driven Obbligatoria
Il codice e la UI devono usare esclusivamente la nomenclatura di dominio seguente: `xG` (Gol Attesi, punteggio totale della giocata), `Tecnica` (valore base), `Fomento` (moltiplicatore), `Convocato` (singola carta da gioco), `Attitudini` (semi delle carte, enum: `FUMATORI`, `RISSOSI`, `MARATONETI`, `IMPROVVISATI`), `Azione` (combinazione di carte giocata), `Fenomeno` (jolly, modificatori passivi limitati a max 5 slot posizionati a bordo campo), `Avversario` (il Buio, target da superare), `Quote` (moneta di gioco), `Bagagliaio` (negozio di fine turno).

### IV. Pipeline di Calcolo Rigorosa e Determinista
La formula base è xG Totali = Tecnica Totale × Fomento Totale. Il calcolo deve seguire questo ordine esatto di esecuzione quando il giocatore conferma l'Azione:
1. Identificazione Azione: carica Tecnica Base e Fomento Base dell'Azione (es. 5 carte consecutive = "Contropiede").
2. Valutazione Convocati: iterare da sinistra a destra l'array dei Convocati giocati, sommando il valore nominale alla Tecnica.
3. Trigger Modificatori Carta: applicare eventuali effetti speciali incollati al singolo Convocato (es. Tacchetti di ferro).
4. Pipeline dei Fenomeni: iterare l'array dei Fenomeni attivi rigorosamente per indice `[0...n]`, da sinistra verso destra; le operazioni che aggiungono Tecnica si sommano, quelle che aggiungono Fomento si sommano, quelle che moltiplicano il Fomento moltiplicano il Fomento corrente (l'ordine di array cambia il risultato matematico finale).

### V. Macchina a Stati del Game Loop
Lo stato di gioco è gestito in Zustand secondo uno State Machine con gli stati seguenti, in ordine di transizione: `INIT_MATCH` (reset statistiche, setup mazzo di base), `SELECT_OPPONENT` (scelta avversario e calcolo target xG), `DRAW_PHASE` (pescata fino al riempimento della mano, es. 8 carte), `PLAYER_ACTION` (idle, attesa selezione Convocati e scelta tra "Gioca l'Azione" o "Scarta"), `CALCULATION_PHASE` (UI bloccata, calcolo punteggio tramite pipeline, trigger eventi e animazioni), `RESOLUTION` (valutazione xG vs target: target raggiunto -> `SHOP_PHASE`; azioni terminate e target non raggiunto -> `GAME_OVER`), `SHOP_PHASE` (spesa Quote nel Bagagliaio, poi ritorno a `SELECT_OPPONENT`).

## Section 2: Modellazione Dati Iniziale

Le entità fondamentali sono modellate separatamente dall'interfaccia:

```typescript
// types/index.ts
export type Attitudine = 'FUMATORI' | 'RISSOSI' | 'MARATONETI' | 'IMPROVVISATI';

export interface Convocato {
  id: string;
  valoreNominale: number; // 2-14 (11=J, 12=Q, 13=K, 14=Asso)
  attitudine: Attitudine;
  equipaggiamento?: string;
}

export interface StatoCalcolo {
  tecnica: number;
  fomento: number;
}

export interface Fenomeno {
  id: string;
  nome: string;
  descrizione: string;
  applicaEffetto: (statoAttuale: StatoCalcolo, contesto: Record<string, unknown>) => StatoCalcolo;
}
```

`applicaEffetto` è una funzione pura che altera lo stato corrente del calcolo senza effetti collaterali sullo stato UI.

## Section 3: Glossario di Dominio e Limiti di Gioco

- `xG` (Gol Attesi): punteggio totale della singola giocata, risultato di Tecnica Totale × Fomento Totale.
- `Tecnica`: valore base, pari a Chips.
- `Fomento`: moltiplicatore, pari a Mult.
- `Convocato`: singola carta da gioco con valore nominale 2-14 e un'Attitudine.
- `Attitudini`: semi delle carte. Valori ammessi: `FUMATORI`, `RISSOSI`, `MARATONETI`, `IMPROVVISATI`.
- `Azione`: combinazione di carte giocata (mano di poker), es. "Contropiede" per 5 carte consecutive.
- `Fenomeno`: jolly/modificatore passivo, massimo 5 slot attivi contemporaneamente, posizionati a bordo campo.
- `Avversario`: il Buio, target xG da superare per avanzare.
- `Quote`: moneta di gioco utilizzata per acquisti.
- `Bagagliaio`: negozio di fine turno dove si spendono le Quote.

## Governance

La presente Costituzione sostituisce e prevale su qualsiasi altra pratica di sviluppo del progetto Quota Campo. Le sue norme sono vincolanti per tutti gli agenti AI e gli sviluppatori coinvolti.

- Procedura di emendamento: ogni modifica deve essere documentata, approvata e accompagnata da un piano di migrazione del codice esistente se impatta le ententi di dominio o il motore di calcolo.
- Policy di versioning: si applica il versioning semantico (MAJOR.MINOR.PATCH). MAJOR per rimozioni o ridefinizioni incompatibili di principi o governance; MINOR per aggiunta o espansione materiale di principi o sezioni; PATCH per chiarimenti, correzioni di testo o refactor non semantici.
- Revisione di conformità: tutte le PR e le revisioni di codice devono verificare la conformità alla Costituzione (stack tecnologico, nomenclatura di dominio, assenza di `any`, purezza delle funzioni di calcolo). Ogni complessità aggiunta deve essere giustificata esplicitamente.

**Version**: 1.1.0 | **Ratified**: 2026-11-10 | **Last Amended**: 2026-11-10
