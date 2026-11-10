# Data Model: Quota Campo - Core Gameplay

**Feature**: 000-calcetto-deckbuilder  
**Date**: 2026-11-10  
**Source**: Feature specification (specs/000-calcetto-deckbuilder/spec.md)  
**Constitution alignment**: Section 2 — Modellazione Dati Iniziale; Section 3 — Glossario di Dominio

---

## Entities

### Convocato (Playing Card)

Represents a single playing card ("Convocato") from the standard 52-card deck.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `string` | Required, unique | Card instance identifier |
| `valoreNominale` | `number` | Required, 2-14 | Card value (2-10 = face value, 11=J, 12=Q, 13=K, 14=Asso). J/Q/K all worth 10 Tecnica; Asso worth 11. |
| `attitudine` | `Attitudine` | Required | One of: `FUMATORI`, `RISSOSI`, `MARATONETI`, `IMPROVVISATI` |
| `equipaggiamento` | `string` | Optional | Modificatore opzionale incollato alla carta (Edizioni, Sigilli) |

**Validation rules**:
- `valoreNominale` must be between 2 and 14 inclusive
- `attitudine` must be one of the 4 enum values

---

### Attitudine (Card Suit)

Enum of the four card suits (semi delle carte).

| Value | Description |
|---|---|
| `FUMATORI` | Smokers suit |
| `RISSOSI` | Brawlers suit |
| `MARATONETI` | Marathoners suit |
| `IMPROVVISATI` | Improvisers suit |

---

### Azione (Played Combination)

Represents a played combination of 1-5 Convocati forming a recognized poker hand.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `tipo` | `AzioneType` | Required | One of 9 valid types (see below) |
| `carte` | `Convocato[]` | Required, 1-5 items | The Convocati that actively compose the combo |
| `tecnicaBase` | `number` | Required | Base Tecnica (Chips) value for this action type |
| `fomentoBase` | `number` | Required | Base Fomento (Mult) value for this action type |

**Valid action types** (in increasing power order):

| Tipo | Italian Name | Poker Equivalent | Carte | Tecnica Base | Fomento Base |
|---|---|---|---|---|---|
| `AZIONE_PERSONALE` | Azione Personale | Carta Alta | 1 | 5 | 1 |
| `DAI_E_VAI` | Dai e Vai | Coppia | 2 | 10 | 2 |
| `TIKI_TAKA` | Tiki-Taka | Doppia Coppia | 4 | 20 | 2 |
| `TRIANGOLO` | Triangolo | Tris | 3 | 30 | 3 |
| `CONTROPIEDE` | Contropiede | Scala | 5 | 30 | 4 |
| `AZIONE_DI_REPARTO` | Azione di Reparto | Colore | 5 | 35 | 4 |
| `SCHEMA_SU_PUNIZIONE` | Schema su Punizione | Full | 5 | 40 | 4 |
| `TORELLO` | Torello | Poker | 4 | 60 | 7 |
| `GOL_AL_VOLO` | Gol al Volo | Scala Reale | 5 | 100 | 8 |

**Calculation rule**: Only the `valoreNominale` of cards that actively compose the combo are summed into Tecnica. Cards played but not part of the combo contribute no points but are still discarded.

---

### Fenomeno (Joker / Passive Modifier)

Represents a passive modifier ("Fenomeno") positioned on the field (a bordo campo). Maximum 5 active slots.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `string` | Required, unique | Fenomeno identifier |
| `nome` | `string` | Required | Display name (e.g., "Il Proprietario del Pallone") |
| `descrizione` | `string` | Required | Human-readable effect description |
| `applicaEffetto` | `(stato: StatoCalcolo, contesto: Record<string, unknown>) => StatoCalcolo` | Required, pure function | Applies the Fenomeno's effect to the current calculation state |

**Validation rules**:
- Maximum 5 Fenomeni active simultaneously (5 slot Fenomeno)
- Fenomeni are evaluated strictly by array index `[0...n]`, left to right
- `applicaEffetto` must be a pure function (no side effects, no UI dependencies)

**MVP Fenomeni** (4 for MVP):
1. **Il Proprietario del Pallone**: +4 Fomento fisso
2. **L'Ansioso**: +15 Tecnica per ogni carta "IMPROVVISATI" giocata in questa mano
3. **Il Bomber**: Moltiplica il Fomento totale per X2, solo se l'Azione contiene una Coppia
4. **L'Arbitro Fiscale**: +20 Fomento, solo se si giocano esattamente 3 carte

---

### StatoCalcolo (Calculation State)

Represents the intermediate state during the xG calculation pipeline.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `tecnica` | `number` | Required | Current accumulated Tecnica |
| `fomento` | `number` | Required | Current accumulated Fomento |

---

### Avversario (Opponent / Il Buio)

Represents an opposing team with a target xG to beat.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `nome` | `string` | Required | Opponent name (e.g., "Cugini", "Organizzati") |
| `targetXG` | `number` | Required | Target xG score to reach for victory |
| `malusRegola` | `string` | Optional | Boss-only rule malus (e.g., "Dai e Vai: Tecnica e Fomento base azzerati") |

**Validation rules**:
- All Bosses share the same fixed Malus (clarification Q4, Option A)
- Malus applies only to Boss (3rd opponent in each Mese), not to base or medium opponents

---

### Partita (Game Session)

Represents a single game session against one Avversario.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `avversario` | `Avversario` | Required | The opponent for this session |
| `maniDisponibili` | `number` | Required, default 4 | Number of times the player can play cards |
| `scartiDisponibili` | `number` | Required, default 3 | Number of times the player can discard |
| `manoAttuale` | `Convocato[]` | Required, max 8 | Cards currently in hand |
| `mazzoRimanente` | `Convocato[]` | Required | Cards left in the deck |
| `punteggioXG` | `number` | Required, default 0 | Accumulated xG score |
| `stato` | `StatoPartita` | Required | Current state machine state |
| `fenomeniAttivi` | `Fenomeno[]` | Required, max 5 | Active Fenomeni modifiers |

**Validation rules**:
- `maniDisponibili` starts at 4, decremented by 1 per Azione played
- `scartiDisponibili` starts at 3, decremented by 1 per discard action
- `manoAttuale` max size is 8, refilled from `mazzoRimanente` after actions/discards
- Deck is reshuffled (full 52 cards) at the start of each partita (clarification Q3, Option A)

---

### Mese (Month Block)

Represents a block of 3 Avversari with incremental xG targets.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `numero` | `number` | Required | Month number (1, 2, 3...) |
| `avversari` | `Avversario[]` | Required, exactly 3 | Base, medium, and Boss opponents |
| `targetBase` | `number` | Required | Base xG target for this month (doubles after Boss defeat) |

**Scaling rule**: After defeating the Boss, `targetBase` of the next Mese doubles relative to the previous month (clarification Q2, Option B).

**Mese 1 targets** (example values): Base 300 / Medio 450 / Alto 600 xG

---

### Quote (Game Currency)

Represents the in-game currency earned and spent by the player.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `quantita` | `number` | Required, >= 0 | Current Quote balance |

**Earning rules**:
- +3 Quote for beating a base Avversario
- +1 Quote per unused Mano remaining at victory
- +1 Quota interest per 5 Quote possessed (max +5 interest for 25+ Quote)

**Persistence**: Quote persists across sessions via LocalStorage (clarification Q1, Option A).

---

### Mazzo (Deck)

Represents the standard 52-card deck.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `carte` | `Convocato[]` | Required, exactly 52 | All cards in the deck |

**Generation**: Standard 52-card deck (13 values × 4 Attitudini). Reshuffled (full 52) at the start of each partita.

---

## State Machine States

| State | Description |
|---|---|
| `INIT_MATCH` | Reset statistics, setup base deck |
| `SELECT_OPPONENT` | Choose opponent, calculate target xG |
| `DRAW_PHASE` | Draw Convocati until hand is full (8 cards) |
| `PLAYER_ACTION` | Idle — waiting for user to select Convocati and choose "Gioca" or "Scarta" |
| `CALCULATION_PHASE` | UI blocked — score calculation via pipeline, trigger events/animations |
| `RESOLUTION` | Evaluate xG vs target: target reached → `SHOP_PHASE`; hands exhausted and target not reached → `GAME_OVER` |
| `SHOP_PHASE` | Spend Quote in Bagagliaio; end → return to `SELECT_OPPONENT` |
| `GAME_OVER` | Terminal state — hands exhausted without reaching target |

---

## Relationships

- **Partita → Avversario**: One opponent per session
- **Partita → Mazzo**: One deck per session (reshuffled each partita)
- **Partita → Fenomeni**: Up to 5 active Fenomeni modifiers applied during calculation
- **Mese → Avversari**: Exactly 3 opponents per month block
- **Mese → targetBase**: Doubles after Boss defeat (next Mese)
- **Quote → Partita**: Earned at session end, spent in Shop

---

## Validation Rules Summary

1. No `any` type anywhere (Constitution Principle II)
2. All types defined in `src/types/index.ts`
3. `applicaEffetto` is a pure function (no side effects)
4. Fenomeni evaluated strictly by array index `[0...n]`
5. Max 5 Fenomeni slots
6. Max 8 cards in hand
7. 4 Mani, 3 Scarti per partita
8. 52-card deck, reshuffled per partita
9. Boss Malus is fixed and shared across all Bosses
