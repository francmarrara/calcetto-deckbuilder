import { Coins } from 'lucide-react';
import { Button } from '../ui/Button';

interface ShopItemProps {
  titolo: string;
  descrizione: string;
  costo: number;
  acquistabile: boolean;
  etichetta?: string;
  onAcquista: () => void;
}

export function ShopItem({
  titolo,
  descrizione,
  costo,
  acquistabile,
  etichetta = 'Acquista',
  onAcquista,
}: ShopItemProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-campo-600 bg-campo-800/80 p-4">
      <h3 className="font-display text-2xl leading-tight text-lime-200">{titolo}</h3>
      <p className="mt-1 flex-1 text-sm text-campo-200">{descrizione}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1 rounded-lg bg-campo-950 px-2 py-1 text-sm font-semibold text-amber-200">
          <Coins size={15} /> {costo}
        </span>
        <Button variante="secondario" disabled={!acquistabile} onClick={onAcquista}>
          {etichetta}
        </Button>
      </div>
    </article>
  );
}
