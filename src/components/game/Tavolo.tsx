import { MousePointerClick, Play, Trash2 } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { AreaDiGioco } from './AreaDiGioco';
import { AvversarioPanel } from './AvversarioPanel';
import { Carta } from './Carta';
import { FenomeniBoard } from './FenomeniBoard';
import { HUD } from './HUD';
import { Button } from '../ui/Button';

export function Tavolo() {
  const avversario = useGameStore((stato) => stato.avversario);
  const punteggioXG = useGameStore((stato) => stato.punteggioXG);
  const maniDisponibili = useGameStore((stato) => stato.maniDisponibili);
  const scartiDisponibili = useGameStore((stato) => stato.scartiDisponibili);
  const manoAttuale = useGameStore((stato) => stato.manoAttuale);
  const selezionate = useGameStore((stato) => stato.selezionate);
  const ultimaGiocata = useGameStore((stato) => stato.ultimaGiocata);
  const stato = useGameStore((valore) => valore.stato);
  const selezionaCarta = useGameStore((valore) => valore.selezionaCarta);
  const deselezionaTutte = useGameStore((valore) => valore.deselezionaTutte);
  const giocaSelezionate = useGameStore((valore) => valore.giocaSelezionate);
  const scartaSelezionate = useGameStore((valore) => valore.scartaSelezionate);

  const inAttesa = stato === 'PLAYER_ACTION';
  const puoGiocare = inAttesa && selezionate.length >= 1;
  const puoScartare = inAttesa && selezionate.length >= 1 && scartiDisponibili > 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <AvversarioPanel avversario={avversario} />
        <div className="lg:col-span-2">
          <FenomeniBoard />
        </div>
      </div>

      <HUD
        punteggioXG={punteggioXG}
        targetXG={avversario?.targetXG ?? 0}
        giocata={ultimaGiocata}
        maniDisponibili={maniDisponibili}
        scartiDisponibili={scartiDisponibili}
      />

      <AreaDiGioco
        giocata={ultimaGiocata}
        inCalcolo={stato === 'CALCULATION_PHASE' || stato === 'RESOLUTION'}
      />

      <section className="rounded-2xl border border-campo-700 bg-campo-900/80 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-campo-300">
            <MousePointerClick size={14} /> Mano ({manoAttuale.length} Convocati)
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-campo-300">
              Selezionati: <strong className="text-lime-300">{selezionate.length}</strong>/5
            </span>
            <Button
              variante="fantasma"
              className="px-2 py-1 text-xs"
              disabled={selezionate.length === 0}
              onClick={deselezionaTutte}
            >
              Deseleziona
            </Button>
          </div>
        </div>

        {manoAttuale.length === 0 ? (
          <p className="rounded-xl border border-dashed border-campo-700 p-6 text-center text-sm text-campo-400">
            Mazzo esaurito: non ci sono più Convocati in mano.
          </p>
        ) : (
          <div className="flex flex-wrap items-end justify-center gap-2 pt-3">
            {manoAttuale.map((carta) => (
              <Carta
                key={carta.id}
                carta={carta}
                selezionata={selezionate.includes(carta.id)}
                disabilitata={!inAttesa}
                onClick={() => selezionaCarta(carta.id)}
              />
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-campo-800 pt-3">
          <Button
            variante="secondario"
            disabled={!puoScartare}
            onClick={scartaSelezionate}
          >
            <Trash2 size={17} />
            Scarta ({scartiDisponibili})
          </Button>
          <Button disabled={!puoGiocare} onClick={giocaSelezionate}>
            <Play size={17} />
            Gioca l’Azione
          </Button>
        </div>
      </section>
    </div>
  );
}
