# Quickstart Validation Guide: Quota Campo - Core Gameplay

**Feature**: 000-calcetto-deckbuilder  
**Date**: 2026-11-10  
**Purpose**: Runnable validation scenarios that prove the feature works end-to-end.

---

## Prerequisites

- Node.js installed (for Vite development server)
- Project dependencies installed (`npm install` or equivalent)
- Vite dev server running (`npm run dev`)

---

## Validation Scenario 1: Complete a Single Match (Primary Loop)

**Validates**: FR-001 through FR-011, SC-001, SC-002

**Steps**:
1. Open the application in a browser
2. Select an Avversario (e.g., "Cugini" with target 300 xG)
3. Verify initial state: 8 cards in hand, 4 Mani available, 3 Scarti available, xG score = 0
4. Select 1-5 cards to form a valid Azione (e.g., a Coppia / "Dai e Vai")
5. Click "Gioca l'Azione"
6. Verify: xG score updates (Tecnica × Fomento pipeline), 1 Mano consumed
7. Repeat until xG >= 300 (target reached)
8. Verify: Victory screen appears, player proceeds to Shop

**Expected outcome**: Player can complete a full match from opponent selection to victory, with xG calculated correctly per the pipeline.

---

## Validation Scenario 2: Discard and Draw Cards

**Validates**: FR-007, FR-009, User Story 2

**Steps**:
1. Start a match with 8 cards in hand
2. Select up to 5 cards to discard
3. Click "Scarta"
4. Verify: discarded cards leave hand, new cards drawn, hand returns to 8 (if deck has cards), 1 Scarto consumed
5. Discard again until Scarti = 0
6. Verify: "Scarta" button is disabled when no Scarti remain

**Expected outcome**: Player can manage their hand through discards and draws within the resource limits.

---

## Validation Scenario 3: Game Over Condition

**Validates**: FR-011

**Steps**:
1. Start a match with target 300 xG
2. Play Azioni without reaching 300 xG
3. Exhaust all 4 Mani
4. Verify: Game Over screen appears when Mani = 0 and xG < 300

**Expected outcome**: Game ends correctly when hands are exhausted before reaching the target.

---

## Validation Scenario 4: Shop / Bagagliaio

**Validates**: FR-012, FR-013, User Story 3

**Steps**:
1. Win a match (reach target xG)
2. Verify: Quote awarded (+3 for opponent beaten, +1 per unused Mano, +interest)
3. Open the Bagagliaio (Shop)
4. Verify: 2 random Fenomeni and 2 Pacchetti are displayed with costs
5. Purchase a Fenomeno with sufficient Quote
6. Verify: Quote balance decreases, Fenomeno appears in active slots (max 5)

**Expected outcome**: Player can spend earned Quote in the shop after victory.

---

## Validation Scenario 5: Calculation Pipeline Order

**Validates**: FR-004, Constitution Principle IV

**Steps**:
1. Place multiple Fenomeni with different effect types (additive Tecnica, additive Fomento, multiplicative Fomento)
2. Order them in different sequences (left to right)
3. Play an Azione and verify the calculated xG changes based on Fenomeni order
4. Verify: Multiplicative Fomento applies to the current Fomento (order-dependent result)

**Expected outcome**: xG calculation respects the pipeline order — Fenomeni evaluated left to right, with multiplicative effects applied to the running Fomento total.

---

## Validation Scenario 6: Persistence Across Sessions

**Validates**: Constitution Principle II (LocalStorage), clarification Q1

**Steps**:
1. Win a match and earn Quote
2. Purchase a Fenomeno in the shop
3. Close and reopen the browser tab
4. Verify: Quote balance and purchased Fenomeni are preserved

**Expected outcome**: Game state persists across browser sessions via LocalStorage.

---

## Validation Scenario 7: Mese Progression and Target Scaling

**Validates**: FR-014, FR-015, clarification Q2

**Steps**:
1. Defeat all 3 Avversari in Mese 1 (including the Boss)
2. Proceed to Mese 2
3. Verify: Base xG target for Mese 2 is double Mese 1's base (e.g., 600 if Mese 1 was 300)

**Expected outcome**: Target base doubles after each Boss defeat (fixed scaling formula).

---

## Validation Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run unit tests (pure engine functions)
npm test

# Build for production (static SPA)
npm run build
```

---

## References

- Feature specification: `specs/000-calcetto-deckbuilder/spec.md`
- Data model: `specs/000-calcetto-deckbuilder/data-model.md`
- Implementation plan: `specs/000-calcetto-deckbuilder/plan.md`
