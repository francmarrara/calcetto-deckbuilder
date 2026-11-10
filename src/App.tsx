import { useEffect } from 'react';
import { Coins, Sparkles, Trophy, X } from 'lucide-react';
import { useGameStore } from './store/useGameStore';
import { Bagagliaio } from './components/shop/Bagagliaio';
import { GameOver } from './components/game/GameOver';
import { SelezioneAvversario } from './components/game/SelezioneAvversario';
import { Tavolo } from './components/game/Tavolo';
import { Button } from './components/ui/Button';

export default function App() {
  const stato = useGameStore((valore) => valore.stato);
  const mese = useGameStore((valore) => valore.mese);
  const quote = useGameStore((valore) => valore.quote);
  const fenomeniAttivi = useGameStore((valore) => valore.fenomeniAttivi);
  const avversario = useGameStore((valore) => valore.avversario);
  const esito = useGameStore((valore) => valore.esito);
  const messaggio = useGameStore((valore) => valore.messaggio);
  const avviaRun = useGameStore((valore) => valore.avviaRun);
  const pulisciMessaggio = useGameStore((valore) => valore.pulisciMessaggio);

  useEffect(() => {
    avviaRun();
  }, [avviaRun]);

  const mostraTavolo =
    stato === 'INIT_MATCH' ||
    stato === 'DRAW_PHASE' ||
    stato === 'PLAYER_ACTION' ||
    stato === 'CALCULATION_PHASE' ||
    stato === 'RESOLUTION';

  return (
    <div className="min-h-screen bg-campo-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(86,191,123,0.18),transparent_45%),radial-gradient(circle_at_80%_100%,rgba(34,131,72,0.16),transparent_50%)]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-12">
        <header className="flex flex-wrap items-center justify-between gap-3 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400 text-campo-950 shadow-neon">
              <Trophy size={24} />
            </span>
            <div>
              <h1 className="font-display text-3xl leading-none tracking-wide text-white">
                QUOTA CAMPO
              </h1>
              <p className="text-xs uppercase tracking-[0.3em] text-campo-300">
                deckbuilder del giovedì sera
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-lg border border-campo-700 bg-campo-900/80 px-3 py-1.5 font-semibold text-campo-100">
              Mese {mese}
            </span>
            <span className="flex items-center gap-1 rounded-lg border border-campo-700 bg-campo-900/80 px-3 py-1.5 font-semibold text-amber-200">
              <Coins size={15} /> {quote}
            </span>
            <span className="flex items-center gap-1 rounded-lg border border-campo-700 bg-campo-900/80 px-3 py-1.5 font-semibold text-lime-200">
              <Sparkles size={15} /> {fenomeniAttivi.length}/5
            </span>
            {avversario ? (
              <span className="rounded-lg border border-campo-700 bg-campo-900/80 px-3 py-1.5 text-campo-100">
                vs <strong className="text-white">{avversario.nome}</strong>
              </span>
            ) : null}
          </div>
        </header>

        {stato === 'SHOP_PHASE' && esito === 'VITTORIA' ? (
          <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-lime-400/50 bg-lime-400/10 px-4 py-2 text-sm font-semibold text-lime-200">
            <Trophy size={16} /> Partita vinta: il Bagagliaio è aperto.
          </div>
        ) : null}

        {messaggio ? (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm text-amber-100">
            <span>{messaggio}</span>
            <Button
              variante="fantasma"
              className="px-2 py-1"
              aria-label="Chiudi messaggio"
              onClick={pulisciMessaggio}
            >
              <X size={14} />
            </Button>
          </div>
        ) : null}

        <main>
          {stato === 'SELECT_OPPONENT' ? <SelezioneAvversario /> : null}
          {stato === 'SHOP_PHASE' ? <Bagagliaio /> : null}
          {stato === 'GAME_OVER' ? <GameOver /> : null}
          {mostraTavolo ? <Tavolo /> : null}
        </main>

        <footer className="mt-8 text-center text-[11px] text-campo-500">
          xG = Tecnica × Fomento · 4 Mani · 3 Scarti · 52 Convocati
        </footer>
      </div>
    </div>
  );
}
