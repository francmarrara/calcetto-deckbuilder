import type { GuidaContenuto } from '../../types';

/**
 * Contenuto statico della Guida, organizzato nelle quattro sezioni richieste.
 * L'ordine copre 0..3 senza buchi (v. data-model.md).
 */
export const GUIDE_SEZIONI: GuidaContenuto[] = [
  {
    id: 'regole-base',
    titolo: 'Regole Base',
    ordine: 0,
    contenuto: [
      'Obiettivo: accumulare xG (Gol Attesi) fino a superare il target dell’Avversario.',
      'Vinci quando il tuo punteggio xG raggiunge o supera il target dell’Avversario (il Buio).',
      'Perdi se esaurisci le 4 Mani senza raggiungere il target dell’Avversario.',
      'Ogni partita si gioca con una mano di 8 Convocati, 4 Mani e 3 Scarti.',
      'I Convocati formano Azioni: la combinazione riconosciuta determina Tecnica e Fomento base.',
      'La formula di ogni giocata è xG = Tecnica × Fomento.',
      'I Fenomeni attivi a bordo campo modificano la pipeline: vengono applicati da sinistra a destra.',
      'Le Quote guadagnate battendo gli Avversari si spendono nel Bagagliaio per acquistare Fenomeni e Pacchetti.',
    ].join('\n'),
  },
  {
    id: 'fasi-turno',
    titolo: 'Fasi del Turno',
    ordine: 1,
    contenuto: [
      '1. Pesca: rifornisci la mano fino a 8 Convocati dal mazzo.',
      '2. Giocata: seleziona da 1 a 5 Convocati e gioca l’Azione. Puoi anche scartare Convocati per pescarne di nuovi.',
      '3. Calcolo xG: il motore identifica l’Azione, somma la Tecnica dei Convocati in combo, applica i modificatori e infine i Fenomeni.',
      '4. Fine Turno: il risultato viene sommato al punteggio xG. Se il target è raggiunto si apre il Bagagliaio, altrimenti si torna alla fase di Giocata.',
      'Attenzione: le Mani disponibili diminuiscono a ogni Azione giocata; gli Scarti sono una risorsa limitata.',
    ].join('\n'),
  },
  {
    id: 'attitudini-ruoli',
    titolo: 'Attitudini e Ruoli',
    ordine: 2,
    contenuto: [
      'Ogni Convocato appartiene a una delle quattro Attitudini (i semi del mazzo, 13 valori ciascuna): Fumatori 🚬, Rissosi 🥊, Maratoneti 🏃 e Improvvisati 🎲.',
      'Le Attitudini contano per le Azioni di colore: l’Azione di Reparto richiede Convocati tutti della stessa Attitudine.',
      'Il simbolo sul Convocato identifica l’Attitudine; il numero in alto a sinistra è il valore nominale (2-14).',
      'La Tecnica effettiva è mostrata in basso: le figure (J/Q/K) valgono 10, l’Asso vale 11, gli altri valori valgono il nominale.',
      'Alcuni Convocati portano un equipaggiamento incollato (es. Tacchetti di Ferro, Polmoni d’Acciaio) che modifica la giocata.',
    ].join('\n'),
  },
  {
    id: 'azioni',
    titolo: 'Azioni',
    ordine: 3,
    contenuto: [
      'Le Azioni riconosciute, dalla più debole alla più forte, sono: Azione Personale, Dai e Vai, Tiki-Taka, Triangolo, Contropiede, Azione di Reparto, Schema su Punizione, Torello e Gol al Volo.',
      'Azione Personale: 1 Convocato, il più alto in mano. Dai e Vai: coppia. Tiki-Taka: doppia coppia. Triangolo: tris. Contropiede: scala. Azione di Reparto: colore, cioè tutte le carte della stessa Attitudine. Schema su Punizione: full house. Torello: poker. Gol al Volo: scala reale.',
      'Ogni Azione fornisce Tecnica e Fomento base; i Convocati in combo aggiungono la loro Tecnica.',
      'Gli equipaggiamenti incollati ai Convocati (es. Tacchetti di Ferro, Polmoni d’Acciaio) si applicano dopo la valutazione dei Convocati e prima dei Fenomeni.',
      'Gli Avversari Boss applicano il Malus: Tecnica e Fomento base dell’Azione Dai e Vai vengono azzerati. Leggi sempre la regola dell’Avversario prima di giocare.',
      'Suggerimento: conserva i Convocati coordinati per le Azioni più forti e sfrutta l’ordine dei Fenomeni per massimizzare xG.',
    ].join('\n'),
  },
];

interface GuideContentProps {
  sezione: GuidaContenuto;
}

export function GuideContent({ sezione }: GuideContentProps) {
  return (
    <article className="space-y-3 text-sm leading-relaxed text-campo-100">
      <h3 className="font-display text-2xl leading-none text-lime-300">{sezione.titolo}</h3>
      <p className="whitespace-pre-line">{sezione.contenuto}</p>
    </article>
  );
}
