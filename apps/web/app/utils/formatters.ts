/**
 * Formatação de datas centralizada (pt-BR). Antes cada página reimplementava
 * a mesma chamada a `toLocaleDateString`.
 */
const BASE_OPTS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

/** Ex.: 24/07/2026 14:30 — retorna '-' quando vazio. */
export const formatDateTime = (iso?: string | null): string => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('pt-BR', BASE_OPTS);
};

/** Ex.: 24 de julho de 2026 14:30 — retorna '' quando vazio. */
export const formatDateLong = (iso?: string | null): string => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', { ...BASE_OPTS, month: 'long' });
};

/**
 * Converte um ISO para o valor aceito por `<input type="datetime-local">`
 * (YYYY-MM-DDTHH:mm), já ajustado para o fuso local.
 */
export const toDatetimeLocal = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
};
