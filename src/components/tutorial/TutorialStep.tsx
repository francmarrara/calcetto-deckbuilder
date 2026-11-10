import { MoveRight, Rocket, Sparkles, Target } from 'lucide-react';
import type { TutorialStato } from '../../types';
import { useGameStore } from '../../store/useGameStore';
import { STILE_ATTITUDINE, etichettaValore, valoreTecnicaCarta } from '../../data/baseDeck';
import { Button } from '../ui/Button';

/** Effetto dei modificatori incollati ai Convocati (engine/calculator.ts). */
const EFFETTI_EQUIPAGGIAMENTO: Record<string, string> = {
  'Tacchetti di Ferro': '+5 Tecnica alla giocata',
  "Polmoni d'Acciaio": '+1 Fomento alla giocata',
};

interface TutorialStepProps {
  step: TutorialStato;
  onAvanza: () => void;
  onCompleta: () => void;
}

/** Contenuto testuale e azione richiesta per ciascuna delle 4 fasi scriptate. */
export function TutorialStep({ step, onAvanza, onCompleta }: TutorialStepProps) {
  const ultimaGiocata = useGameStore((stato) => stato.ultimaGiocata);
  const manoAttuale = useGameStore((stato) => stato.manoAttuale);

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-campo-400">
            Tutorial · Fase {step.faseAttiva} di 4
          </p>
          <h2 className="font-display text-3xl leading-none text-lime-300">
            {step.faseAttiva === 1
              ? 'La Mano'
              : step.faseAttiva === 2
                ? 'Il Piazzamento'
                : step.faseAttiva === 3
                  ? 'Risoluzione e xG'
                  : 'Fine Turno'}
          </h2>
        </div>
        <span className="rounded-full bg-lime-400/15 px-3 py-1 text-xs font-semibold text-lime-200">
          {step.faseAttiva}/4
        </span>
      </header>

      {step.faseAttiva === 1 ? (
        <div className="space-y-3 text-sm leading-relaxed text-campo-100">
          <p>
            Questi sono i tuoi <strong className="text-white">Convocati</strong>. Il numero in alto a
            sinistra è il valore nominale (2-14); in basso trovi la Tecnica effettiva (le figure
            valgono 10, l’Asso vale 11, gli altri valori valgono il nominale).
          </p>

          <ul className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-campo-700 bg-campo-950/60 p-2">
            {manoAttuale.map((convocato) => {
              const stile = STILE_ATTITUDINE[convocato.attitudine];
              return (
                <li
                  key={convocato.id}
                  className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 px-2 py-1 text-xs"
                >
                  <span className="font-semibold text-white">
                    {etichettaValore(convocato.valoreNominale)} {stile.simbolo}{' '}
                    {stile.etichetta}
                  </span>
                  <span className="text-campo-200">Tecnica {valoreTecnicaCarta(convocato)}</span>
                  <span className="text-campo-300">
                    {convocato.equipaggiamento
                      ? `${convocato.equipaggiamento} (${
                          EFFETTI_EQUIPAGGIAMENTO[convocato.equipaggiamento] ?? 'effetto attivo'
                        })`
                      : 'nessun equipaggiamento'}
                  </span>
                </li>
              );
            })}
          </ul>

          <p>
            Il simbolo indica l’<strong className="text-white">Attitudine</strong>: Fumatori,
            Rissosi, Maratoneti o Improvvisati. In questa versione il{' '}
            <strong className="text-white">costo</strong> dei Convocati non è modellato: puoi
            giocare da 1 a 5 Convocati per Azione senza alcun costo.
          </p>
          <p className="rounded-lg bg-campo-950/60 p-3 text-xs text-campo-200">
            Obiettivo: formare un’Azione con 1-5 Convocati e generare più xG possibile. Le altre
            interazioni sono bloccate finché non hai letto la mano.
          </p>
          <Button className="w-full" onClick={onAvanza}>
            <MoveRight size={17} />
            Ho letto, continua
          </Button>
        </div>
      ) : null}

      {step.faseAttiva === 2 ? (
        <div className="space-y-3 text-sm leading-relaxed text-campo-100">
          <p>
            Trascina il <strong className="text-white">Convocato evidenziato</strong> (l’Asso di
            Fumatori) sul tavolo per piazzarlo e giocare l’Azione.
          </p>
          <p className="flex items-start gap-2 rounded-lg bg-lime-400/10 p-3 text-xs text-lime-100">
            <Target size={16} className="mt-0.5 shrink-0" />
            <span>
              Puoi anche selezionarlo con un clic e premere “Gioca l’Azione”. Le altre interazioni
              restano bloccate.
            </span>
          </p>
        </div>
      ) : null}

      {step.faseAttiva === 3 ? (
        <div className="space-y-3 text-sm leading-relaxed text-campo-100">
          <p>
            Il Convocato è stato risolto. La pipeline calcola{' '}
            <strong className="text-white">xG = Tecnica × Fomento</strong> e il punteggio viene
            sommato al totale.
          </p>

          {ultimaGiocata ? (
            <div className="rounded-lg border border-lime-400/40 bg-campo-950/60 p-3">
              <p className="font-display text-2xl text-lime-300">
                {ultimaGiocata.statoCalcolo.tecnica} Tecnica ×{' '}
                {ultimaGiocata.statoCalcolo.fomento} Fomento = {ultimaGiocata.xg} xG
              </p>
              <ol className="mt-2 space-y-1 text-xs text-campo-200">
                {ultimaGiocata.passaggi.map((passaggio, indice) => (
                  <li key={`${passaggio}-${indice}`} className="flex gap-2">
                    <span className="font-mono text-campo-400">{indice + 1}.</span>
                    <span>{passaggio}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="rounded-lg bg-campo-950/60 p-3 text-xs text-campo-200">
              Seleziona il Convocato e gioca l’Azione per vedere il calcolo xG.
            </p>
          )}

          <Button className="w-full" onClick={onAvanza}>
            <Sparkles size={17} />
            Continua
          </Button>
        </div>
      ) : null}

      {step.faseAttiva === 4 ? (
        <div className="space-y-3 text-sm leading-relaxed text-campo-100">
          <p>
            Fine turno. L’<strong className="text-white">Avversario</strong> è{' '}
            <strong className="text-white">il Buio</strong>: in questa partita tutorial ha un target
            di {step.avversarioParametri.targetXG} xG.
          </p>
          <p>
            Il Buio non gioca Convocati: resta il bersaglio da superare. Accumula xG nei turni
            successivi per raggiungere il target, poi potrai affrontare una partita libera.
          </p>
          <p className="flex items-start gap-2 rounded-lg bg-amber-400/10 p-3 text-xs text-amber-100">
            <Rocket size={16} className="mt-0.5 shrink-0" />
            <span>
              Hai completato tutte e quattro le fasi: il tutorial si chiude e torni al Menu
              Principale.
            </span>
          </p>
          <Button className="w-full" onClick={onCompleta}>
            <Rocket size={17} />
            Fine Turno e concludi il Tutorial
          </Button>
        </div>
      ) : null}
    </div>
  );
}
