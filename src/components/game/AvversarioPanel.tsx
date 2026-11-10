import { ShieldAlert, Target } from 'lucide-react';
import type { Avversario } from '../../types';
import { etichettaTipoAvversario } from '../../data/avversari';

interface AvversarioPanelProps {
  avversario: Avversario | null;
}

const COLORE_TIPO: Record<Avversario['tipo'], string> = {
  BASE: 'bg-campo-700 text-lime-100',
  MEDIO: 'bg-amber-500/20 text-amber-200',
  BOSS: 'bg-rose-500/20 text-rose-200',
};

export function AvversarioPanel({ avversario }: AvversarioPanelProps) {
  if (!avversario) {
    return (
      <div className="rounded-2xl border border-campo-700 bg-campo-900/60 p-4 text-sm text-campo-300">
        Nessun Avversario selezionato.
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-campo-700 bg-campo-900/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-campo-300">
            Avversario
          </p>
          <h2 className="font-display text-3xl leading-none text-white">{avversario.nome}</h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${COLORE_TIPO[avversario.tipo]}`}
        >
          {etichettaTipoAvversario(avversario.tipo)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-lime-200">
        <Target size={18} />
        <span className="font-semibold">
          Target {avversario.targetXG.toLocaleString('it-IT')} xG
        </span>
      </div>

      {avversario.malusRegola ? (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-rose-950/50 p-2 text-xs text-rose-200">
          <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          <span>
            <strong>Malus Boss:</strong> {avversario.malusRegola}
          </span>
        </p>
      ) : null}
    </section>
  );
}
