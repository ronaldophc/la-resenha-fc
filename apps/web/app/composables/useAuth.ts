import { useState, useCookie, navigateTo } from '#app';
import { computed } from 'vue';
import { useApi } from './useApi';

interface User {
  id: number;
  email: string;
  name?: string;
  role?: string;
}

export const useAuth = () => {
  const { request } = useApi();
  
  // Estado reativo compartilhado do usuário (SSR-safe)
  const user = useState<User | null>('auth_user', () => null);
  
  // Cookie seguro contendo o token JWT
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 8, // 8 horas (duração igual à do backend JWT_EXPIRATION)
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  // Computed para verificar se está autenticado
  const isAuthenticated = computed(() => !!token.value);

  /**
   * Realiza login no backend, armazena o token e busca as informações do usuário.
   */
  const login = async (credentials: { email: string; password?: string }) => {
    try {
      const response = await request<{ data: { token: string; user: User } }>('/auth/login', {
        method: 'POST',
        body: credentials,
      });

      if (response && response.data) {
        token.value = response.data.token;
        user.value = response.data.user;
        await navigateTo('/admin');
        return { success: true };
      }
      return { success: false, error: 'Resposta de login inválida.' };
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Falha ao autenticar. Verifique suas credenciais.';
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Remove o token, limpa o estado do usuário e redireciona para a página de login.
   */
  const logout = async () => {
    token.value = null;
    user.value = null;
    await navigateTo('/admin/login');
  };

  /**
   * Busca as informações do perfil do usuário autenticado no backend.
   */
  const fetchUser = async () => {
    if (!token.value) {
      user.value = null;
      return null;
    }

    try {
      const response = await request<{ data: User }>('/auth/profile');
      if (response && response.data) {
        user.value = response.data;
        return response.data;
      }
      return null;
    } catch (error) {
      // Se houver erro (token inválido/expirado), limpa a sessão local
      token.value = null;
      user.value = null;
      return null;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    fetchUser,
  };
};
