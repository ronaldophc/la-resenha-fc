import { useRuntimeConfig, useCookie, useState, navigateTo } from '#app';

/** Quantidade de requisições GET (carregamento de conteúdo) em andamento. */
export const useApiPending = () => useState<number>('api-pending-count', () => 0);

export const useApi = () => {
  const config = useRuntimeConfig();
  const token = useCookie('auth_token');
  const apiBase = config.public.apiBase || 'http://localhost:3001';
  const pending = useApiPending();

  /**
   * Faz uma requisição HTTP para a API NestJS, injetando o token JWT automaticamente
   * e tratando erros comuns como 401 Unauthorized.
   */
  const request = async <T>(path: string, options: any = {}): Promise<T> => {
    const headers = {
      Accept: 'application/json',
      ...options.headers,
    } as Record<string, string>;

    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`;
    }

    // Garante que o path comece com /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    // GETs carregam conteúdo de página: alimentam o overlay global de loading.
    // Ações (POST/PATCH/DELETE) têm feedback próprio nos botões.
    const isContentLoad = !options.method || String(options.method).toUpperCase() === 'GET';
    if (isContentLoad && process.client) pending.value++;

    try {
      return await $fetch<T>(`${apiBase}${cleanPath}`, {
        ...options,
        headers,
      });
    } catch (error: any) {
      // Se receber 401 (Não autorizado), limpa a sessão local e redireciona para o login
      if (error.status === 401) {
        token.value = null;
        if (process.client) {
          navigateTo('/admin/login');
        }
      }
      throw error;
    } finally {
      if (isContentLoad && process.client) pending.value = Math.max(0, pending.value - 1);
    }
  };

  return {
    request,
    apiBase,
  };
};
