import { INFO_AZIONI } from '../../engine/evaluator';
import type { UltimaGiocata } from '../../types';
import { Carta } from './Carta';

interface AreaDiGiocoProps {
  giocata: UltimaGiocata | null;
  inCalcolo: boolean;
}

export function AreaDiGioco({ giocata, inCalcolo }: AreaDiGiocoProps) {
  if (!giocata) {
    return (
      <section className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-campo-700 bg-campo-900/40 p-6 text-center text-sm text-campo-300">
        {inCalcolo
          ? 'Calcolo xG in corso…'
          : 'Seleziona da 1 a 5 Convocati dalla mano per formare un’Azione.'}
      </section>
    );
  }

  const info = INFO_AZIONI[giocata.azione.tipo];

  return (
    <section className="animate-pop-in rounded-2xl border border-campo-700 bg-campo-900/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-campo-300">
            Azione riconosciuta
          </p>
          <h2 className="font-display text-3xl leading-none text-lime-300">{info.nome}</h2>
        </div>
        <p className="rounded-xl bg-campo-950 px-3 py-2 font-display text-2xl text-white">
          {giocata.xg} <span className="text-lime-300">xG</span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        {giocata.azione.carte.map((carta, indice) => (
          <Carta key={`${carta.id}-${indice}`} carta={carta} piccola disabilitata />
        ))}
      </div>

      <ol className="mt-4 space-y-1 border-t border-campo-800 pt-3 text-xs text-campo-200">
        {giocata.passaggi.map((passaggio, indice) => (
          <li key={`${passaggio}-${indice}`} className="flex gap-2">
            <span className="font-mono text-campo-400">{indice + 1}.</span>
            <span>{passaggio}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
