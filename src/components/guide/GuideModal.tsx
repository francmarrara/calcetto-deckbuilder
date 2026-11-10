import { useEffect } from 'react';
import { BookOpen, X } from 'lucide-react';
import type { GuidaContenuto } from '../../types';
import { Button } from '../ui/Button';
import { GuideTabs } from './GuideTabs';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: GuidaContenuto[];
}

/**
 * Vista modale a schermo intero della Guida.
 *
 * Non modifica alcuno stato di gioco: chiudendola la partita sottostante
 * riprende esattamente da dove era stata lasciata (FR-003, FR-004).
 */
export function GuideModal({ isOpen, onClose, sections }: GuideModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const gestisciTastiera = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', gestisciTastiera);
    return () => window.removeEventListener('keydown', gestisciTastiera);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-campo-950/85 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="guida-titolo"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-campo-600 bg-campo-900 shadow-2xl"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-campo-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-300">
              <BookOpen size={20} />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-campo-400">
                Regole
              </p>
              <h2 id="guida-titolo" className="font-display text-3xl leading-none text-white">
                Guida
              </h2>
            </div>
          </div>

          <Button variante="fantasma" className="px-2 py-1" aria-label="Chiudi Guida" onClick={onClose}>
            <X size={18} />
          </Button>
        </header>

        <div className="overflow-y-auto px-5 py-5">
          <GuideTabs sections={sections} />
        </div>
      </section>
    </div>
  );
}
