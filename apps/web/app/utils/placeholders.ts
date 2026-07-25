/**
 * Imagens de fallback (placeholder) e handler para o evento `@error` de `<img>`.
 * Centraliza as URLs que estavam espalhadas e repetidas nas páginas.
 */
export const PLACEHOLDER_TEAM =
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=100&auto=format&fit=crop';

export const PLACEHOLDER_CHAMP =
  'https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=100&auto=format&fit=crop';

/**
 * Handler de erro de carregamento de imagem. Troca a src pelo fallback informado.
 * O guard evita loop caso o próprio fallback falhe.
 *
 * Uso no template: `@error="onImageError($event, PLACEHOLDER_TEAM)"`
 */
export const onImageError = (event: Event, fallback: string) => {
  const el = event.target as HTMLImageElement | null;
  if (el && el.src !== fallback) el.src = fallback;
};
