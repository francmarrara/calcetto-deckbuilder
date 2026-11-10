import { Coins, Lock, ShieldAlert, Sparkles, Target } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { etichettaTipoAvversario } from '../../data/avversari';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';

const COLORE_TIPO: Record<'BASE' | 'MEDIO' | 'BOSS', string> = {
  BASE: 'border-campo-600',
  MEDIO: 'border-amber-500/60',
  BOSS: 'border-rose-500/70',
};

export function SelezioneAvversario() {
  const mese = useGameStore((stato) => stato.mese);
  const targetBaseMese = useGameStore((stato) => stato.targetBaseMese);
  const avversari = useGameStore((stato) => stato.avversariMese);
  const indiceAvversario = useGameStore((stato) => stato.indiceAvversario);
  const selezionaAvversario = useGameStore((stato) => stato.selezionaAvversario);
  const quote = useGameStore((stato) => stato.quote);
  const fenomeniAttivi = useGameStore((stato) => stato.fenomeniAttivi);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-campo-700 bg-campo-900/80 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-campo-300">
              Mese {mese}
            </p>
            <h2 className="font-display text-4xl leading-none text-white">
              Scegli il prossimo Avversario
            </h2>
            <p className="mt-1 text-sm text-campo-300">
              Target base del Mese: {targetBaseMese.toLocaleString('it-IT')} xG
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 rounded-lg bg-campo-800 px-3 py-2 text-amber-200">
              <Coins size={16} /> {quote} Quote
            </span>
            <span className="flex items-center gap-1 rounded-lg bg-campo-800 px-3 py-2 text-lime-200">
              <Sparkles size={16} /> {fenomeniAttivi.length} Fenomeni
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {avversari.map((avversario, indice) => {
          const bloccato = indice !== indiceAvversario;
          const corrente = indice === indiceAvversario;

          return (
            <article
              key={avversario.id}
              className={cn(
                'relative flex flex-col rounded-2xl border-2 bg-campo-900/70 p-4 transition',
                COLORE_TIPO[avversario.tipo],
                corrente ? 'shadow-neon' : 'opacity-70',
              )}
            >
              {bloccato ? (
                <span className="absolute right-3 top-3 text-campo-400" title="Avversario bloccato">
                  <Lock size={18} />
                </span>
              ) : null}

              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-campo-300">
                {etichettaTipoAvversario(avversario.tipo)}
              </p>
              <h3 className="mt-1 font-display text-3xl leading-none text-white">
                {avversario.nome}
              </h3>

              <p className="mt-3 flex items-center gap-2 text-lime-200">
                <Target size={18} />
                <span className="font-semibold">
                  {avversario.targetXG.toLocaleString('it-IT')} xG
                </span>
              </p>

              {avversario.malusRegola ? (
                <p className="mt-3 flex items-start gap-2 rounded-lg bg-rose-950/50 p-2 text-xs text-rose-200">
                  <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                  <span>{avversario.malusRegola}</span>
                </p>
              ) : (
                <p className="mt-3 text-xs text-campo-400">
                  Nessuna regola speciale.
                </p>
              )}

              <div className="mt-auto pt-4">
                <Button
                  className="w-full"
                  disabled={!corrente}
                  onClick={() => selezionaAvversario(avversario.id)}
                >
                  {corrente ? 'Affronta' : 'Bloccato'}
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-center text-xs text-campo-400">
        Battuto il Boss, il target base del Mese successivo raddoppia.
      </p>
    </div>
  );
}
