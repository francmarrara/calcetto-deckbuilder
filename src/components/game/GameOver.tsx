import { RotateCcw, Skull } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { Button } from '../ui/Button';

export function GameOver() {
  const avversario = useGameStore((stato) => stato.avversario);
  const punteggioXG = useGameStore((stato) => stato.punteggioXG);
  const maniDisponibili = useGameStore((stato) => stato.maniDisponibili);
  const quote = useGameStore((stato) => stato.quote);
  const fenomeniAttivi = useGameStore((stato) => stato.fenomeniAttivi);
  const nuovaRun = useGameStore((stato) => stato.nuovaRun);

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-rose-500/60 bg-rose-950/40 p-6 text-center">
      <p className="flex items-center justify-center gap-3 font-display text-5xl leading-none text-rose-200">
        <Skull size={36} /> Game Over
      </p>
      <p className="mt-3 text-sm text-rose-100">
        {avversario ? (
          <>
            <strong>{avversario.nome}</strong> ha retto: hai chiuso a{' '}
            <strong>{punteggioXG} xG</strong> contro un target di{' '}
            <strong>{avversario.targetXG} xG</strong>.
          </>
        ) : (
          'Le Mani sono terminate prima di raggiungere il target.'
        )}
      </p>
      <p className="mt-2 text-xs text-rose-200/80">
        Mani residue: {maniDisponibili} · Quote conservate: {quote} · Fenomeni:{' '}
        {fenomeniAttivi.length}
      </p>

      <Button className="mt-6" onClick={nuovaRun}>
        <RotateCcw size={17} />
        Nuova Run
      </Button>
    </section>
  );
}
