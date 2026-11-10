import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useAudio } from './useAudio';

interface AudioManagerProps {
  musicaAttiva: boolean;
  sfxAttivi: boolean;
  userInteracted: boolean;
}

const MESSAGGIO_ERRORE =
  /non valida|massimo|Seleziona almeno|Non hai|insufficienti|non disponibile|slot pieni|non è ancora disponibile/i;

/**
 * Controller audio senza UI visibile.
 *
 * - La BGM parte solo dopo la prima interazione utente (autoplay policy).
 * - Gli SFX sono indipendenti dalla musica e seguono `sfxAttivi`.
 * - Gli eventi di gioco (pesca, piazzamento, fischio, goal, errore) sono
 *   derivati dai cambiamenti dello store, senza accoppiare il motore all'audio.
 */
export function AudioManager({ musicaAttiva, sfxAttivi, userInteracted }: AudioManagerProps) {
  const { playBgm, stopBgm, playSfx } = useAudio();

  const avversario = useGameStore((stato) => stato.avversario);
  const punteggioXG = useGameStore((stato) => stato.punteggioXG);
  const stato = useGameStore((stato) => stato.stato);
  const ultimaGiocata = useGameStore((stato) => stato.ultimaGiocata);
  const mazzoRimanente = useGameStore((stato) => stato.mazzoRimanente);
  const messaggio = useGameStore((stato) => stato.messaggio);

  // BGM: solo dopo la prima interazione e solo se la preferenza è attiva.
  useEffect(() => {
    if (userInteracted && musicaAttiva) {
      playBgm();
      return;
    }
    stopBgm();
  }, [userInteracted, musicaAttiva, playBgm, stopBgm]);

  // Click di interfaccia su qualunque bottone.
  useEffect(() => {
    if (!sfxAttivi) return;

    const gestisciClick = (evento: MouseEvent) => {
      const target = evento.target;
      if (target instanceof Element && target.closest('button')) {
        playSfx('click');
      }
    };

    document.addEventListener('click', gestisciClick);
    return () => document.removeEventListener('click', gestisciClick);
  }, [sfxAttivi, playSfx]);

  // Pesca di Convocati: "swoosh" quando il mazzo rimanente si riduce.
  const carteNelMazzoPrecedenti = useRef(mazzoRimanente.length);
  useEffect(() => {
    if (sfxAttivi && mazzoRimanente.length < carteNelMazzoPrecedenti.current) {
      playSfx('swoosh');
    }
    carteNelMazzoPrecedenti.current = mazzoRimanente.length;
  }, [mazzoRimanente, sfxAttivi, playSfx]);

  // Piazzamento/risoluzione: "thud" a ogni nuova giocata, "goal" al target.
  const giocataPrecedente = useRef(ultimaGiocata);
  useEffect(() => {
    const nuovaGiocata =
      ultimaGiocata !== null && ultimaGiocata !== giocataPrecedente.current;
    giocataPrecedente.current = ultimaGiocata;

    if (!sfxAttivi || !nuovaGiocata) return;

    playSfx('thud');
    if (avversario && punteggioXG >= avversario.targetXG) {
      playSfx('goal');
    }
  }, [ultimaGiocata, sfxAttivi, playSfx, avversario, punteggioXG]);

  // Fischio arbitro: inizio partita (l'Avversario viene scelto, anche nel
  // tutorial) e fine partita (Bagagliaio o Game Over).
  const avversarioPrecedente = useRef(avversario);
  const statoPrecedente = useRef(stato);
  useEffect(() => {
    const avversarioPrecedenteValue = avversarioPrecedente.current;
    const statoPrecedenteValue = statoPrecedente.current;
    avversarioPrecedente.current = avversario;
    statoPrecedente.current = stato;

    if (!sfxAttivi) return;
    if (!avversarioPrecedenteValue && avversario) {
      playSfx('fischio');
    }
    if (stato === 'SHOP_PHASE' && statoPrecedenteValue !== 'SHOP_PHASE') {
      playSfx('fischio');
    }
    if (stato === 'GAME_OVER' && statoPrecedenteValue !== 'GAME_OVER') {
      playSfx('fischio');
    }
  }, [avversario, stato, sfxAttivi, playSfx]);

  // Suono di errore per le mosse non valide.
  const messaggioPrecedente = useRef(messaggio);
  useEffect(() => {
    const precedente = messaggioPrecedente.current;
    messaggioPrecedente.current = messaggio;

    if (!sfxAttivi || !messaggio || messaggio === precedente) return;
    if (MESSAGGIO_ERRORE.test(messaggio)) playSfx('errore');
  }, [messaggio, sfxAttivi, playSfx]);

  return null;
}
