import { useToast } from './useToast';

/**
 * Centraliza o feedback ao usuário (toasts) e a normalização de mensagens de erro
 * da API. Substitui os wrappers `showFeedback`/extração de erro que eram copiados
 * em todas as páginas do admin.
 *
 * Uso:
 *   const { showFeedback, getErrorMessage } = useFeedback();
 *   showFeedback('success', 'Salvo!');
 *   showFeedback('error', getErrorMessage(error, 'Falha ao salvar.'));
 */
export const useFeedback = () => {
  const toast = useToast();

  const showFeedback = (type: 'success' | 'error', message: string) => {
    if (type === 'success') toast.success(message);
    else toast.error(message);
  };

  // A API pode devolver `message` como string única ou array (class-validator). Normaliza.
  const getErrorMessage = (error: any, fallback = 'Ocorreu um erro. Tente novamente.') => {
    const msg = error?.data?.message;
    return (Array.isArray(msg) ? msg[0] : msg) || fallback;
  };

  return { toast, showFeedback, getErrorMessage };
};
