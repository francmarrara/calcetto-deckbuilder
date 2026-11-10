# UI Contract: Guida, Tutorial e Comparto Audio

**Feature**: `001-guida-tutorial-audio`
**Date**: 2026-11-10
**Type**: Web application (SPA) — contratti UI tra componenti React

Questo documento definisce i contratti di interfaccia dei nuovi componenti React introdotti dalla feature. Non contiene implementazione, ma firme di componente (props ed eventi) e stati condivisi.

---

## 1. GuideModal

Componente modale a schermo intero che ospita la Guida (Regole). Aperto dal Menu Principale e dal Menu di Pausa.

**Props**:
| Prop | Tipo | Obbligatorio | Descrizione |
|------|------|--------------|-------------|
| isOpen | boolean | sì | Controlla visibilità del modale |
| onClose | function | sì | Callback invocato alla chiusura (ripristina stato partita se in corso) |
| sections | GuidaContenuto[] | sì | Array delle 4 sezioni della Guida |

**Eventi**:
- `onClose`: il modale viene chiuso; lo stato della partita sottostante deve rimanere intatto.

---

## 2. GuideTabs

Componente a schede (Tabs) per navigare tra le sezioni della Guida senza perdere i progressi della partita.

**Props**:
| Prop | Tipo | Obbligatorio | Descrizione |
|------|------|--------------|-------------|
| sections | GuidaContenuto[] | sì | Sezioni disponibili |
| activeSectionId | string | no | ID della sezione attiva (default: prima sezione) |
| onSectionChange | function | no | Callback al cambio di scheda |

---

## 3. TutorialOverlay

Overlay guidato che blocca le interazioni non necessarie e illumina l'elemento UI target. Gestisce le 4 fasi scriptate.

**Props**:
| Prop | Tipo | Obbligatorio | Descrizione |
|------|------|--------------|-------------|
| isActive | boolean | sì | Controlla visibilità dell'overlay |
| step | TutorialStato | sì | Stato corrente del tutorial (fase, target, blocco) |
| onStepComplete | function | sì | Callback quando il giocatore completa la fase corrente |
| onTutorialComplete | function | sì | Callback al completamento di tutte e 4 le fasi |

**Eventi**:
- `onStepComplete`: invocato dopo che il giocatore ha eseguito l'azione richiesta (es. trascinato la `Convocato` target).
- `onTutorialComplete`: invocato al termine della fase 4.

---

## 4. AudioSettingsPanel

Pannello Impostazioni con toggle indipendenti per Musica e SFX. Presente nel Menu Principale e in Pausa.

**Props**:
| Prop | Tipo | Obbligatorio | Descrizione |
|------|------|--------------|-------------|
| musicaAttiva | boolean | sì | Stato corrente della musica |
| sfxAttivi | boolean | sì | Stato corrente degli SFX |
| onMusicaChange | function | sì | Callback al toggle Musica |
| onSfxChange | function | sì | Callback al toggle SFX |

---

## 5. AudioManager

Componente/controller audio (nessuna UI visibile) che gestisce BGM e SFX in base alle preferenze e all'autoplay policy.

**Props**:
| Prop | Tipo | Obbligatorio | Descrizione |
|------|------|--------------|-------------|
| musicaAttiva | boolean | sì | Se la musica è attiva |
| sfxAttivi | boolean | sì | Se gli SFX sono attivi |
| userInteracted | boolean | sì | Se l'utente ha già interagito (per avvio BGM) |

**Eventi**:
- Nessun evento UI; espone metodi imperativi `playBgm()`, `stopBgm()`, `playSfx(nome)`.

**Contratto comportamento**:
- `playBgm()` parte solo se `userInteracted === true` (rispetta autoplay policy browser).
- Gli SFX sono riprodotti indipendentemente dal BGM, in base a `sfxAttivi`.
- La musica è in loop.

---

## Stati condivisi (Zustand slice)

### useAudioStore

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| musicaAttiva | boolean | Preferenza musica |
| sfxAttivi | boolean | Preferenza SFX |
| setMusicaAttiva | function | Imposta preferenza musica |
| setSfxAttivi | function | Imposta preferenza SFX |

### Flag primo avvio (useGameStore o storage dedicato)

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| primoAvvio | boolean | `true` al primissimo avvio assoluto |
