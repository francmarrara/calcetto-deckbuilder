/** Unisce condizionalmente le classi Tailwind. */
export function cn(
  ...classi: Array<string | false | null | undefined>
): string {
  return classi.filter(Boolean).join(' ');
}
