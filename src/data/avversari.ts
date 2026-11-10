import type { Avversario, TipoAvversario } from '../types';

/** Nomi degli Avversari, ruotati in base al Mese. */
const NOMI_AVVERSARI: readonly string[] = [
  'Cugini',
  'Organizzati',
  'Il Buio',
  'Trattoria FC',
  'Bar Sport',
  'Il Presidente',
  'I Raccomandati',
  'Gli Sfaticati',
  'Il Mister',
];

/** Malus unico e fisso condiviso da tutti i Boss. */
export const MALUS_BOSS = 'Dai e Vai: Tecnica e Fomento base azzerati';

/** Target base del primo Mese. */
export const TARGET_BASE_INIZIALE = 300;

const MOLTIPLICATORI: Record<TipoAvversario, number> = {
  BASE: 1,
  MEDIO: 1.5,
  BOSS: 2,
};

const ETICHETTE_TIPO: Record<TipoAvversario, string> = {
  BASE: 'Avversario',
  MEDIO: 'Avversario Ostico',
  BOSS: 'Boss',
};

/** Crea i tre Avversari di un Mese a partire dal target base. */
export function creaAvversariMese(mese: number, targetBase: number): Avversario[] {
  const tipi: readonly TipoAvversario[] = ['BASE', 'MEDIO', 'BOSS'];
  const offset = (mese - 1) * 3;

  return tipi.map((tipo, indice) => {
    const nome = NOMI_AVVERSARI[(offset + indice) % NOMI_AVVERSARI.length];
    const avversario: Avversario = {
      id: `mese-${mese}-avversario-${indice}`,
      nome,
      targetXG: Math.round(targetBase * MOLTIPLICATORI[tipo]),
      tipo,
    };

    if (tipo === 'BOSS') {
      avversario.malusRegola = MALUS_BOSS;
    }

    return avversario;
  });
}

/** Etichetta leggibile del tipo di Avversario. */
export function etichettaTipoAvversario(tipo: TipoAvversario): string {
  return ETICHETTE_TIPO[tipo];
}
