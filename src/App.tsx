import { useEffect, useState } from 'react';
import {
  BookOpen,
  Coins,
  GraduationCap,
  Home,
  Pause,
  Play,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { useGameStore } from './store/useGameStore';
import { useAudioStore } from './store/useAudioStore';
import { AudioManager } from './components/audio/AudioManager';
import { AudioSettingsPanel } from './components/audio/AudioSettingsPanel';
import { GUIDE_SEZIONI } from './components/guide/GuideContent';
import { GuideModal } from './components/guide/GuideModal';
import { TutorialOverlay } from './components/tutorial/TutorialOverlay';
import { useTutorialStore } from './components/tutorial/TutorialState';
import { Bagagliaio } from './components/shop/Bagagliaio';
import { GameOver } from './components/game/GameOver';
import { SelezioneAvversario } from './components/game/SelezioneAvversario';
import { Tavolo } from './components/game/Tavolo';
import { Button } from './components/ui/Button';
import {
  caricaFlagPrimoAvvio,
  caricaTutorialCompletato,
  salvaFlagPrimoAvvio,
} from './utils/storage';

type Schermata = 'menu' | 'partita';

export default function App() {
  const stato = useGameStore((valore) => valore.stato);
  const mese = useGameStore((valore) => valore.mese);
  const quote = useGameStore((valore) => valore.quote);
  const fenomeniAttivi = useGameStore((valore) => valore.fenomeniAttivi);
  const avversario = useGameStore((valore) => valore.avversario);
  const esito = useGameStore((valore) => valore.esito);
  const messaggio = useGameStore((valore) => valore.messaggio);
  const avviaRun = useGameStore((valore) => valore.avviaRun);
  const nuovaRun = useGameStore((valore) => valore.nuovaRun);
  const pulisciMessaggio = useGameStore((valore) => valore.pulisciMessaggio);

  const musicaAttiva = useAudioStore((valore) => valore.musicaAttiva);
  const sfxAttivi = useAudioStore((valore) => valore.sfxAttivi);
  const setMusicaAttiva = useAudioStore((valore) => valore.setMusicaAttiva);
  const setSfxAttivi = useAudioStore((valore) => valore.setSfxAttivi);

  const tutorial = useTutorialStore();

  const [schermata, setSchermata] = useState<Schermata>('menu');
  const [pausaAperta, setPausaAperta] = useState(false);
  const [guidaAperta, setGuidaAperta] = useState(false);
  const [primoAvvioAperto, setPrimoAvvioAperto] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    const primoAvvio = caricaFlagPrimoAvvio();
    if (primoAvvio && !caricaTutorialCompletato()) {
      setPrimoAvvioAperto(true);
    }
    salvaFlagPrimoAvvio(false);
  }, []);

  const segnalaInterazione = () => {
    if (!userInteracted) setUserInteracted(true);
  };

  const avviaPartita = () => {
    tutorial.interrompiTutorial();
    avviaRun();
    setPausaAperta(false);
    setSchermata('partita');
  };

  const avviaTutorialGuidato = () => {
    setPrimoAvvioAperto(false);
    setPausaAperta(false);
    setGuidaAperta(false);
    tutorial.avviaTutorial();
    setSchermata('partita');
  };

  const concludiTutorial = () => {
    tutorial.completaTutorial();
    nuovaRun();
    setPausaAperta(false);
    setSchermata('menu');
  };

  const tornaAlMenu = () => {
    tutorial.interrompiTutorial();
    nuovaRun();
    setPausaAperta(false);
    setSchermata('menu');
  };

  const mostraTavolo =
    stato === 'INIT_MATCH' ||
    stato === 'DRAW_PHASE' ||
    stato === 'PLAYER_ACTION' ||
    stato === 'CALCULATION_PHASE' ||
    stato === 'RESOLUTION';

  return (
    <div
      className="min-h-screen bg-campo-950 text-slate-100"
      onPointerDownCapture={segnalaInterazione}
      onKeyDownCapture={segnalaInterazione}
    >
      <AudioManager
        musicaAttiva={musicaAttiva}
        sfxAttivi={sfxAttivi}
        userInteracted={userInteracted}
      />

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

          {schermata === 'partita' ? (
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
              <Button
                variante="secondario"
                disabled={tutorial.attivo}
                title={tutorial.attivo ? 'Non disponibile durante il Tutorial' : undefined}
                onClick={() => setPausaAperta(true)}
              >
                <Pause size={16} />
                Pausa
              </Button>
            </div>
          ) : null}
        </header>

        {schermata === 'partita' && stato === 'SHOP_PHASE' && esito === 'VITTORIA' ? (
          <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-lime-400/50 bg-lime-400/10 px-4 py-2 text-sm font-semibold text-lime-200">
            <Trophy size={16} /> Partita vinta: il Bagagliaio è aperto.
          </div>
        ) : null}

        {schermata === 'partita' && messaggio ? (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm text-amber-100">
            <span>{messaggio}</span>
            <Button
              variante="fantasma"
              className="px-2 py-1"
              aria-label="Chiudi messaggio"
              disabled={tutorial.attivo}
              onClick={pulisciMessaggio}
            >
              <X size={14} />
            </Button>
          </div>
        ) : null}

        <main>
          {schermata === 'menu' ? (
            <section
              aria-label="Menu principale"
              className="mx-auto max-w-3xl space-y-5 rounded-2xl border border-campo-700 bg-campo-900/80 p-6 shadow-lg"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-campo-300">
                  Menu Principale
                </p>
                <h2 className="mt-1 font-display text-4xl leading-none text-white">
                  Preparati alla partita
                </h2>
                <p className="mt-2 text-sm text-campo-300">
                  Accumula xG, batti l’Avversario (il Buio) e spendi le Quote nel Bagagliaio.
                  Consulta le Regole o impara giocando con il Tutorial guidato.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Button onClick={avviaPartita}>
                  <Play size={17} />
                  Gioca
                </Button>
                <Button variante="secondario" onClick={avviaTutorialGuidato}>
                  <GraduationCap size={17} />
                  Gioca Tutorial
                </Button>
                <Button variante="secondario" onClick={() => setGuidaAperta(true)}>
                  <BookOpen size={17} />
                  Guida / Regole
                </Button>
              </div>

              <AudioSettingsPanel
                musicaAttiva={musicaAttiva}
                sfxAttivi={sfxAttivi}
                onMusicaChange={setMusicaAttiva}
                onSfxChange={setSfxAttivi}
              />
            </section>
          ) : (
            <>
              {stato === 'SELECT_OPPONENT' ? <SelezioneAvversario /> : null}
              {stato === 'SHOP_PHASE' ? <Bagagliaio /> : null}
              {stato === 'GAME_OVER' ? <GameOver /> : null}
              {mostraTavolo ? <Tavolo /> : null}
            </>
          )}
        </main>

        <footer className="mt-8 text-center text-[11px] text-campo-500">
          xG = Tecnica × Fomento · 4 Mani · 3 Scarti · 52 Convocati
        </footer>
      </div>

      <GuideModal
        isOpen={guidaAperta}
        onClose={() => setGuidaAperta(false)}
        sections={GUIDE_SEZIONI}
      />

      <TutorialOverlay
        isActive={tutorial.attivo && !tutorial.completato}
        step={tutorial}
        onStepComplete={tutorial.completaFase}
        onTutorialComplete={concludiTutorial}
      />

      {pausaAperta ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-campo-950/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pausa-titolo"
        >
          <section className="w-full max-w-md space-y-4 rounded-2xl border border-campo-600 bg-campo-900 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-campo-400">
                  Partita in corso
                </p>
                <h2 id="pausa-titolo" className="font-display text-3xl leading-none text-white">
                  Pausa
                </h2>
              </div>
              <Button
                variante="fantasma"
                className="px-2 py-1"
                aria-label="Riprendi la partita"
                onClick={() => setPausaAperta(false)}
              >
                <X size={18} />
              </Button>
            </div>

            <div className="grid gap-2">
              <Button onClick={() => setPausaAperta(false)}>
                <Play size={17} />
                Riprendi
              </Button>
              <Button
                variante="secondario"
                onClick={() => {
                  setPausaAperta(false);
                  setGuidaAperta(true);
                }}
              >
                <BookOpen size={17} />
                Guida / Regole
              </Button>
            </div>

            <AudioSettingsPanel
              musicaAttiva={musicaAttiva}
              sfxAttivi={sfxAttivi}
              onMusicaChange={setMusicaAttiva}
              onSfxChange={setSfxAttivi}
            />

            <Button variante="fantasma" className="w-full" onClick={tornaAlMenu}>
              <Home size={17} />
              Torna al Menu Principale
            </Button>
          </section>
        </div>
      ) : null}

      {primoAvvioAperto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-campo-950/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="primo-avvio-titolo"
        >
          <section className="w-full max-w-lg space-y-4 rounded-2xl border-2 border-lime-300/70 bg-campo-900 p-6 shadow-neon">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-campo-400">
                Primo avvio
              </p>
              <h2
                id="primo-avvio-titolo"
                className="font-display text-3xl leading-none text-white"
              >
                Benvenuto in Quota Campo
              </h2>
            </div>

            <p className="text-sm text-campo-200">
              È il tuo primissimo avvio. Vuoi iniziare con il Tutorial guidato? In quattro fasi
              imparerai La Mano, Il Piazzamento, la Risoluzione xG e la Fine Turno contro il Buio.
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button onClick={avviaTutorialGuidato}>
                <GraduationCap size={17} />
                Sì, Gioca Tutorial
              </Button>
              <Button variante="secondario" onClick={() => setPrimoAvvioAperto(false)}>
                No, vai al Menu
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
