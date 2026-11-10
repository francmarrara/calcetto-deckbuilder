import { ArrowRight, Coins, Package, Sparkles, Trophy } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { ShopItem } from './ShopItem';
import { Button } from '../ui/Button';

export function Bagagliaio() {
  const quote = useGameStore((stato) => stato.quote);
  const ultimoGuadagno = useGameStore((stato) => stato.ultimoGuadagno);
  const shopFenomeni = useGameStore((stato) => stato.shopFenomeni);
  const shopPacchetti = useGameStore((stato) => stato.shopPacchetti);
  const fenomeniAttivi = useGameStore((stato) => stato.fenomeniAttivi);
  const acquistaFenomeno = useGameStore((stato) => stato.acquistaFenomeno);
  const acquistaPacchetto = useGameStore((stato) => stato.acquistaPacchetto);
  const prossimoAvversario = useGameStore((stato) => stato.prossimoAvversario);
  const avversario = useGameStore((stato) => stato.avversario);

  const bossBattuto = avversario?.tipo === 'BOSS';
  const slotsPieni = fenomeniAttivi.length >= 5;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-lime-400/50 bg-lime-400/10 p-5 text-center">
        <p className="flex items-center justify-center gap-2 font-display text-4xl leading-none text-lime-200">
          <Trophy size={30} /> Vittoria!
        </p>
        <p className="mt-2 text-sm text-lime-100">
          {avversario ? `${avversario.nome} battuto. ` : ''}
          Hai guadagnato <strong className="text-amber-200">+{ultimoGuadagno} Quote</strong> tra
          Avversario, Mani residue e interessi.
        </p>
        <p className="mt-2 flex items-center justify-center gap-2 text-amber-200">
          <Coins size={18} />
          <span className="text-lg font-bold">{quote} Quote disponibili</span>
        </p>
      </section>

      <section className="rounded-2xl border border-campo-700 bg-campo-900/80 p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-campo-300">
              Bagagliaio
            </p>
            <h2 className="font-display text-4xl leading-none text-white">
              Potenzia la squadra
            </h2>
          </div>
          <p className="flex items-center gap-1 text-sm text-lime-200">
            <Sparkles size={16} /> {fenomeniAttivi.length}/5 slot Fenomeno
          </p>
        </div>

        <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-campo-300">
          Fenomeni
        </h3>
        {shopFenomeni.length === 0 ? (
          <p className="rounded-xl border border-dashed border-campo-700 p-4 text-sm text-campo-400">
            Nessun Fenomeno disponibile: hai già acquisito tutto il catalogo MVP.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {shopFenomeni.map((offerta) => (
              <ShopItem
                key={offerta.fenomeno.id}
                titolo={offerta.fenomeno.nome}
                descrizione={offerta.fenomeno.descrizione}
                costo={offerta.costo}
                acquistabile={quote >= offerta.costo && !slotsPieni}
                onAcquista={() => acquistaFenomeno(offerta.fenomeno.id)}
              />
            ))}
          </div>
        )}

        <h3 className="mb-2 mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-campo-300">
          <Package size={14} /> Pacchetti
        </h3>
        {shopPacchetti.length === 0 ? (
          <p className="rounded-xl border border-dashed border-campo-700 p-4 text-sm text-campo-400">
            Nessun Pacchetto disponibile.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {shopPacchetti.map((pacchetto) => (
              <ShopItem
                key={pacchetto.id}
                titolo={pacchetto.nome}
                descrizione={pacchetto.descrizione}
                costo={pacchetto.costo}
                acquistabile={quote >= pacchetto.costo && !slotsPieni}
                etichetta="Apri"
                onAcquista={() => acquistaPacchetto(pacchetto.id)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <Button onClick={prossimoAvversario} className="px-6 py-3 text-base">
          {bossBattuto ? 'Prossimo Mese' : 'Prossimo Avversario'}
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}
