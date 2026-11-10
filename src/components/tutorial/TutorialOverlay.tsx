import { useEffect, useRef } from 'react';
import type { TutorialStato } from '../../types';
import { useGameStore } from '../../store/useGameStore';
import { CONVOCATO_TUTORIAL_ID } from './TutorialState';
import { TutorialStep } from './TutorialStep';
import { cn } from '../../utils/cn';

interface TutorialOverlayProps {
  isActive: boolean;
  step: TutorialStato;
  onStepComplete: () => void;
  onTutorialComplete: () => void;
}

/**
 * Overlay del tutorial guidato.
 *
 * Dimma la scena ma lascia interagibile l'elemento target; le interazioni
 * non necessarie sono disabilitate nei componenti di gioco. La transizione
 * 2 -> 3 viene rilevata quando il Convocato target viene effettivamente giocato.
 */
export function TutorialOverlay({
  isActive,
  step,
  onStepComplete,
  onTutorialComplete,
}: TutorialOverlayProps) {
  const ultimaGiocata = useGameStore((stato) => stato.ultimaGiocata);
  const giocataPrecedente = useRef(ultimaGiocata);

  useEffect(() => {
    const precedente = giocataPrecedente.current;
    giocataPrecedente.current = ultimaGiocata;

    if (!isActive || step.faseAttiva !== 2) return;
    if (!ultimaGiocata || ultimaGiocata === precedente) return;

    const convocatoTargetGiocato = ultimaGiocata.azione.carte.some(
      (convocato) => convocato.id === CONVOCATO_TUTORIAL_ID,
    );
    if (convocatoTargetGiocato) onStepComplete();
  }, [isActive, step.faseAttiva, ultimaGiocata, onStepComplete]);

  if (!isActive) return null;

  // FR-011: con `interazioniBloccate` l'overlay cattura ogni interazione
  // fuori dal suo pannello. Nella fase 2 resta trasparente al puntatore:
  // l'unico elemento interagibile è il Convocato target sul tavolo.
  const bloccaSotto = step.interazioniBloccate && step.faseAttiva !== 2;

  return (
    <div
      className={cn(
        'fixed inset-0 z-40 flex items-start justify-center bg-campo-950/60 p-4 pt-20 backdrop-blur-[2px]',
        bloccaSotto ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      role="presentation"
      data-tutorial-overlay="true"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Tutorial guidato"
        className="pointer-events-auto w-full max-w-lg animate-pop-in rounded-2xl border-2 border-lime-300/70 bg-campo-900 p-5 shadow-neon"
      >
        <TutorialStep step={step} onAvanza={onStepComplete} onCompleta={onTutorialComplete} />
      </section>
    </div>
  );
}
