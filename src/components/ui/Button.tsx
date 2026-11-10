import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

type Variante = 'primario' | 'secondario' | 'fantasma' | 'pericolo';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  children: ReactNode;
}

const STILI_VARIANTE: Record<Variante, string> = {
  primario:
    'bg-lime-400 text-campo-950 hover:bg-lime-300 border-lime-300 shadow-neon',
  secondario:
    'bg-campo-800 text-lime-100 hover:bg-campo-700 border-campo-600',
  fantasma:
    'bg-transparent text-lime-100 hover:bg-campo-800/70 border-campo-700',
  pericolo:
    'bg-rose-600 text-white hover:bg-rose-500 border-rose-400',
};

export function Button({
  variante = 'primario',
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 font-semibold tracking-wide transition',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none',
        STILI_VARIANTE[variante],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
