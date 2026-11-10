import { Music2, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AudioSettingsPanelProps {
  musicaAttiva: boolean;
  sfxAttivi: boolean;
  onMusicaChange: (attiva: boolean) => void;
  onSfxChange: (attivi: boolean) => void;
}

interface ToggleAudioProps {
  etichetta: string;
  descrizione: string;
  attivo: boolean;
  onChange: (attivo: boolean) => void;
  icona: 'musica' | 'sfx';
}

function ToggleAudio({ etichetta, descrizione, attivo, onChange, icona }: ToggleAudioProps) {
  const Icona = icona === 'musica' ? Music2 : attivo ? Volume2 : VolumeX;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={attivo}
      aria-label={`${etichetta}: ${attivo ? 'attivo' : 'disattivato'}`}
      onClick={() => onChange(!attivo)}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition',
        attivo
          ? 'border-lime-400/50 bg-lime-400/10 text-lime-100'
          : 'border-campo-700 bg-campo-900/70 text-campo-300',
      )}
    >
      <span className="flex items-center gap-2">
        <Icona size={18} />
        <span>
          <span className="block text-sm font-semibold">{etichetta}</span>
          <span className="block text-[11px] text-campo-400">{descrizione}</span>
        </span>
      </span>

      <span
        aria-hidden="true"
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border transition',
          attivo ? 'border-lime-300 bg-lime-400' : 'border-campo-600 bg-campo-800',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all',
            attivo ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </span>
    </button>
  );
}

/** Pannello Impostazioni con toggle indipendenti per Musica e SFX. */
export function AudioSettingsPanel({
  musicaAttiva,
  sfxAttivi,
  onMusicaChange,
  onSfxChange,
}: AudioSettingsPanelProps) {
  return (
    <section
      aria-label="Impostazioni audio"
      className="rounded-2xl border border-campo-700 bg-campo-900/80 p-4"
    >
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-campo-300">
        Impostazioni Audio
      </h3>

      <div className="grid gap-2 sm:grid-cols-2">
        <ToggleAudio
          etichetta="Musica"
          descrizione="BGM in loop dopo la prima interazione"
          attivo={musicaAttiva}
          onChange={onMusicaChange}
          icona="musica"
        />
        <ToggleAudio
          etichetta="SFX"
          descrizione="Effetti sonori di gioco"
          attivo={sfxAttivi}
          onChange={onSfxChange}
          icona="sfx"
        />
      </div>
    </section>
  );
}
