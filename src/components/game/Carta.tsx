import type { Convocato } from '../../types';
import { STILE_ATTITUDINE, etichettaValore, valoreTecnicaCarta } from '../../data/baseDeck';
import { cn } from '../../utils/cn';

interface CartaProps {
  carta: Convocato;
  selezionata?: boolean;
  disabilitata?: boolean;
  piccola?: boolean;
  onClick?: () => void;
}

export function Carta({
  carta,
  selezionata = false,
  disabilitata = false,
  piccola = false,
  onClick,
}: CartaProps) {
  const stile = STILE_ATTITUDINE[carta.attitudine];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabilitata}
      aria-pressed={selezionata}
      aria-label={`${etichettaValore(carta.valoreNominale)} ${stile.etichetta}`}
      className={cn(
        'group relative flex shrink-0 flex-col items-center justify-between rounded-xl border-2 bg-slate-50 text-slate-900 shadow-carta transition',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300',
        stile.bordo,
        piccola ? 'h-20 w-14 p-1' : 'h-28 w-20 p-2',
        selezionata
          ? '-translate-y-3 border-lime-300 ring-4 ring-lime-300/70'
          : 'hover:-translate-y-1 hover:border-lime-200',
        disabilitata && 'cursor-not-allowed opacity-50 hover:translate-y-0',
      )}
    >
      <span
        className={cn(
          'self-start font-bold leading-none',
          piccola ? 'text-sm' : 'text-lg',
          stile.testo,
        )}
      >
        {etichettaValore(carta.valoreNominale)}
      </span>

      <span className={cn('leading-none', piccola ? 'text-xl' : 'text-3xl')}>
        {stile.simbolo}
      </span>

      <span
        className={cn(
          'w-full rounded-md bg-slate-900 px-1 text-center font-bold text-lime-300',
          piccola ? 'text-[10px]' : 'text-xs',
        )}
        title="Tecnica fornita dal Convocato"
      >
        {valoreTecnicaCarta(carta)}
      </span>
    </button>
  );
}
