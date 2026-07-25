import { useState } from '#app';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

// Contador de ids único por sessão de página (client-side)
let counter = 0;

/**
 * Fila global de notificações (toasts) exibidas no canto superior direito.
 * Uso: const toast = useToast(); toast.success('...'); toast.error('...').
 */
export const useToast = () => {
  const toasts = useState<Toast[]>('toasts', () => []);

  const remove = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const show = (type: ToastType, message: string, duration = 5000) => {
    const id = ++counter;
    toasts.value = [...toasts.value, { id, type, message }];
    if (duration > 0 && typeof window !== 'undefined') {
      setTimeout(() => remove(id), duration);
    }
    return id;
  };

  return {
    toasts,
    remove,
    show,
    success: (message: string) => show('success', message, 5000),
    // Erros ficam um pouco mais para dar tempo de ler
    error: (message: string) => show('error', message, 7000),
    info: (message: string) => show('info', message, 5000),
  };
};
