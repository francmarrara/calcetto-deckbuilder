import { useState } from 'react';
import type { GuidaContenuto } from '../../types';
import { cn } from '../../utils/cn';
import { GuideContent } from './GuideContent';

interface GuideTabsProps {
  sections: GuidaContenuto[];
  /** ID della sezione attiva; se omesso il componente gestisce lo stato interno. */
  activeSectionId?: string;
  onSectionChange?: (id: string) => void;
}

/** Schede della Guida: cambiano contenuto senza toccare lo stato della partita. */
export function GuideTabs({ sections, activeSectionId, onSectionChange }: GuideTabsProps) {
  const ordinate = [...sections].sort((prima, seconda) => prima.ordine - seconda.ordine);
  const primaSezione = ordinate[0]?.id ?? '';
  const [sezioneInterna, setSezioneInterna] = useState(primaSezione);

  const sezioneAttiva = activeSectionId ?? sezioneInterna;
  const sezioneCorrente =
    ordinate.find((sezione) => sezione.id === sezioneAttiva) ?? ordinate[0];

  const cambiaSezione = (id: string) => {
    if (activeSectionId === undefined) setSezioneInterna(id);
    onSectionChange?.(id);
  };

  if (!sezioneCorrente) {
    return (
      <p className="rounded-xl border border-dashed border-campo-700 p-6 text-center text-sm text-campo-300">
        Nessuna sezione della Guida disponibile.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Sezioni della Guida"
        className="flex flex-wrap gap-2 border-b border-campo-800 pb-3"
      >
        {ordinate.map((sezione) => {
          const attiva = sezione.id === sezioneCorrente.id;
          return (
            <button
              key={sezione.id}
              type="button"
              role="tab"
              aria-selected={attiva}
              aria-controls={`guida-pannello-${sezione.id}`}
              id={`guida-tab-${sezione.id}`}
              onClick={() => cambiaSezione(sezione.id)}
              className={cn(
                'rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition',
                attiva
                  ? 'border-lime-300 bg-lime-400/15 text-lime-200'
                  : 'border-campo-700 bg-campo-900/60 text-campo-300 hover:border-campo-500 hover:text-campo-100',
              )}
            >
              {sezione.titolo}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`guida-pannello-${sezioneCorrente.id}`}
        aria-labelledby={`guida-tab-${sezioneCorrente.id}`}
      >
        <GuideContent sezione={sezioneCorrente} />
      </div>
    </div>
  );
}
