/** Fisher-Yates: restituisce una nuova copia mescolata dell'array. */
export function mescola<T>(elementi: readonly T[]): T[] {
  const copia = [...elementi];

  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temporaneo = copia[i];
    copia[i] = copia[j];
    copia[j] = temporaneo;
  }

  return copia;
}
