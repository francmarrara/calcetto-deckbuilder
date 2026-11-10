import type { UltimaGiocata } from '../../types';
import { cn } from '../../utils/cn';

interface HUDProps {
  punteggioXG: number;
  targetXG: number;
  giocata: UltimaGiocata | null;
  maniDisponibili: number;
  scartiDisponibili: number;
}

export function HUD({
  punteggioXG,
  targetXG,
  giocata,
  maniDisponibili,
  scartiDisponibili,
}: HUDProps) {
  const percentuale = targetXG > 0 ? Math.min(100, (punteggioXG / targetXG) * 100) : 0;
  const obiettivoRaggiunto = punteggioXG >= targetXG;

  return (
    <section className="rounded-2xl border border-campo-700 bg-campo-900/80 p-4 shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-campo-300">
            Punteggio xG
          </p>
          <p
            className={cn(
              'font-display text-5xl leading-none tabular-nums',
              obiettivoRaggiunto ? 'text-lime-300' : 'text-white',
            )}
          >
            {punteggioXG.toLocaleString('it-IT')}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-campo-300">
            Target
          </p>
          <p className="font-display text-3xl leading-none text-lime-200 tabular-nums">
            {targetXG.toLocaleString('it-IT')}
          </p>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-campo-950">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            obiettivoRaggiunto ? 'bg-lime-300' : 'bg-emerald-500',
          )}
          style={{ width: `${percentuale}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-lg bg-campo-800 px-2 py-1 text-campo-100">
          Mani <strong className="text-lime-300">{maniDisponibili}</strong>
        </span>
        <span className="rounded-lg bg-campo-800 px-2 py-1 text-campo-100">
          Scarti <strong className="text-amber-300">{scartiDisponibili}</strong>
        </span>

        {giocata ? (
          <span
            key={`${giocata.azione.tipo}-${giocata.xg}`}
            className="ml-auto animate-pop-in rounded-lg bg-lime-400/10 px-2 py-1 font-semibold text-lime-200"
          >
            {giocata.statoCalcolo.tecnica} Tecnica × {giocata.statoCalcolo.fomento} Fomento ={' '}
            {giocata.xg} xG
          </span>
        ) : null}
      </div>
    </section>
  );
}
