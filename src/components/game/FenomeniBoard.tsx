import type { CSSProperties } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Sparkles } from 'lucide-react';
import type { Fenomeno } from '../../types';
import { useGameStore } from '../../store/useGameStore';
import { cn } from '../../utils/cn';

const MAX_SLOT = 5;

interface SlotProps {
  fenomeno: Fenomeno;
  indice: number;
}

function SlotFenomeno({ fenomeno, indice }: SlotProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: fenomeno.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex w-40 flex-col rounded-xl border border-campo-600 bg-campo-800/90 p-2 text-xs shadow-lg',
        isDragging && 'z-10 border-lime-300 opacity-90',
      )}
    >
      <button
        type="button"
        className="mb-1 flex cursor-grab items-center gap-1 text-left text-[10px] font-semibold uppercase tracking-wider text-campo-300 active:cursor-grabbing"
        aria-label={`Riordina ${fenomeno.nome}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={12} />
        Slot {indice + 1}
      </button>
      <p className="font-semibold leading-tight text-lime-200">{fenomeno.nome}</p>
      <p className="mt-1 leading-snug text-campo-200">{fenomeno.descrizione}</p>
    </li>
  );
}

/** Fenomeni attivi a bordo campo, riordinabili via drag & drop (l'ordine cambia il calcolo). */
export function FenomeniBoard() {
  const fenomeniAttivi = useGameStore((stato) => stato.fenomeniAttivi);
  const riordinaFenomeni = useGameStore((stato) => stato.riordinaFenomeni);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.over) return;
    riordinaFenomeni(String(event.active.id), String(event.over.id));
  };

  return (
    <section className="rounded-2xl border border-campo-700 bg-campo-900/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-campo-300">
          <Sparkles size={14} /> Fenomeni a bordo campo
        </p>
        <span className="text-[10px] uppercase tracking-widest text-campo-400">
          {fenomeniAttivi.length}/{MAX_SLOT} slot
        </span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={fenomeniAttivi.map((fenomeno) => fenomeno.id)}
          strategy={horizontalListSortingStrategy}
        >
          <ul className="flex flex-wrap gap-2">
            {fenomeniAttivi.map((fenomeno, indice) => (
              <SlotFenomeno key={fenomeno.id} fenomeno={fenomeno} indice={indice} />
            ))}

            {Array.from({ length: Math.max(0, MAX_SLOT - fenomeniAttivi.length) }).map(
              (_valore, indice) => (
                <li
                  key={`slot-vuoto-${indice}`}
                  className="flex h-[104px] w-40 items-center justify-center rounded-xl border border-dashed border-campo-700 text-[10px] uppercase tracking-widest text-campo-500"
                >
                  Slot libero
                </li>
              ),
            )}
          </ul>
        </SortableContext>
      </DndContext>

      <p className="mt-3 text-[10px] text-campo-400">
        Trascina i Fenomeni per cambiarne l’ordine: la pipeline li valuta da sinistra a destra.
      </p>
    </section>
  );
}
