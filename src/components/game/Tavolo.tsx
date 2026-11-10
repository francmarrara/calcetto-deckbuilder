import type { CSSProperties, ReactNode } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MousePointerClick, Play, Trash2 } from 'lucide-react';
import type { Convocato } from '../../types';
import { useGameStore, MAX_CARTE_GIOCABILI } from '../../store/useGameStore';
import { CONVOCATO_TUTORIAL_ID, useTutorialStore } from '../tutorial/TutorialState';
import { cn } from '../../utils/cn';
import { AreaDiGioco } from './AreaDiGioco';
import { AvversarioPanel } from './AvversarioPanel';
import { Carta } from './Carta';
import { FenomeniBoard } from './FenomeniBoard';
import { HUD } from './HUD';
import { Button } from '../ui/Button';

interface CartaSortableProps {
  carta: Convocato;
  selezionata: boolean;
  disabilitata: boolean;
  evidenziata: boolean;
  onClick: () => void;
}

/** Convocato in mano: trascinabile per riordinare, cliccabile per selezionare. */
function CartaSortable({
  carta,
  selezionata,
  disabilitata,
  evidenziata,
  onClick,
}: CartaSortableProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: carta.id, disabled: disabilitata });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'touch-none select-none rounded-xl',
        isDragging && 'opacity-80',
        evidenziata &&
          'animate-pulse ring-4 ring-lime-300 ring-offset-2 ring-offset-campo-950',
      )}
      {...attributes}
      {...listeners}
    >
      <Carta
        carta={carta}
        selezionata={selezionata}
        disabilitata={disabilitata}
        onClick={onClick}
      />
    </div>
  );
}

/**
 * Priorità al tavolo quando il puntatore è dentro la sua area; altrimenti
 * si ricade sul comportamento standard di riordino della mano.
 */
const rilevaCollisioni: CollisionDetection = (argomenti) => {
  const collisioniPuntatore = pointerWithin(argomenti);
  if (collisioniPuntatore.length === 0) return closestCenter(argomenti);

  const tavolo = collisioniPuntatore.find((collisione) => collisione.id === 'tavolo');
  if (tavolo) {
    return [
      tavolo,
      ...collisioniPuntatore.filter((collisione) => collisione.id !== 'tavolo'),
    ];
  }

  return collisioniPuntatore;
};

/** Area del tavolo che accetta il trascinamento di un Convocato dalla mano. */
function ZonaTavolo({ children, evidenzia }: { children: ReactNode; evidenzia: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'tavolo' });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-2xl transition',
        evidenzia &&
          'ring-4 ring-lime-300/70 ring-offset-2 ring-offset-campo-950',
        isOver && 'ring-4 ring-lime-400',
      )}
    >
      {children}
    </div>
  );
}

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
  const riordinaMano = useGameStore((valore) => valore.riordinaMano);

  const tutorialAttivo = useTutorialStore((valore) => valore.attivo);
  const faseTutorial = useTutorialStore((valore) => valore.faseAttiva);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    if (!overId) return;

    // Trascinare un Convocato sul tavolo lo piazza: il Convocato entra nella
    // selezione (se manca) e l'Azione viene giocata subito, in partita
    // libera e nel tutorial (fase 2).
    if (overId === 'tavolo') {
      if (!selezionate.includes(activeId)) {
        if (selezionate.length >= MAX_CARTE_GIOCABILI) return;
        selezionaCarta(activeId);
      }
      giocaSelezionate();
      return;
    }

    // Durante il tutorial solo l'elemento target è interagibile (FR-011):
    // il riordino della mano è bloccato.
    if (tutorialAttivo) return;

    riordinaMano(activeId, overId);
  };

  const inAttesa = stato === 'PLAYER_ACTION';
  const convocatoTutorial = tutorialAttivo && faseTutorial === 2 ? CONVOCATO_TUTORIAL_ID : null;
  const puoGiocare =
    inAttesa &&
    selezionate.length >= 1 &&
    (!tutorialAttivo ||
      (faseTutorial === 2 && selezionate.every((id) => id === CONVOCATO_TUTORIAL_ID)));
  const puoScartare =
    !tutorialAttivo && inAttesa && selezionate.length >= 1 && scartiDisponibili > 0;

  return (
    <DndContext sensors={sensors} collisionDetection={rilevaCollisioni} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <AvversarioPanel avversario={avversario} />
          <div
            className={cn(
              'lg:col-span-2 transition',
              tutorialAttivo && 'pointer-events-none opacity-60',
            )}
          >
            <FenomeniBoard />
          </div>
        </div>

        <div
          className={cn(
            'rounded-2xl transition',
            tutorialAttivo &&
              faseTutorial === 3 &&
              'ring-4 ring-lime-300 ring-offset-2 ring-offset-campo-950',
          )}
        >
          <HUD
            punteggioXG={punteggioXG}
            targetXG={avversario?.targetXG ?? 0}
            giocata={ultimaGiocata}
            maniDisponibili={maniDisponibili}
            scartiDisponibili={scartiDisponibili}
          />
        </div>

        <ZonaTavolo evidenzia={tutorialAttivo && faseTutorial === 2}>
          <AreaDiGioco
            giocata={ultimaGiocata}
            inCalcolo={stato === 'CALCULATION_PHASE' || stato === 'RESOLUTION'}
          />
        </ZonaTavolo>

        <section
          className={cn(
            'rounded-2xl border border-campo-700 bg-campo-900/80 p-4 transition',
            tutorialAttivo &&
              faseTutorial === 1 &&
              'ring-4 ring-lime-300 ring-offset-2 ring-offset-campo-950',
          )}
        >
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
            <SortableContext
              items={manoAttuale.map((carta) => carta.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-wrap items-end justify-center gap-2 pt-3">
                {manoAttuale.map((carta) => (
                  <CartaSortable
                    key={carta.id}
                    carta={carta}
                    selezionata={selezionate.includes(carta.id)}
                    disabilitata={!inAttesa || (tutorialAttivo && carta.id !== convocatoTutorial)}
                    evidenziata={convocatoTutorial === carta.id}
                    onClick={() => selezionaCarta(carta.id)}
                  />
                ))}
              </div>
            </SortableContext>
          )}

          <p className="mt-3 text-center text-[10px] text-campo-400">
            {tutorialAttivo && faseTutorial === 2
              ? 'Trascina il Convocato evidenziato sul tavolo per giocarlo.'
              : 'Trascina i Convocati per riordinarli in mano; trascina un Convocato sul tavolo per piazzare l’Azione selezionata.'}
          </p>

          <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-campo-800 pt-3">
            <Button
              variante="secondario"
              disabled={!puoScartare}
              onClick={scartaSelezionate}
            >
              <Trash2 size={17} />
              Scarta ({scartiDisponibili})
            </Button>
            <Button
              disabled={!puoGiocare}
              onClick={giocaSelezionate}
              data-tutorial-target={tutorialAttivo && faseTutorial === 2 ? 'gioca-azione' : undefined}
            >
              <Play size={17} />
              Gioca l’Azione
            </Button>
          </div>
        </section>
      </div>
    </DndContext>
  );
}
