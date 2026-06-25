import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useAuth } from '../composables/useAuth';

export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth();

  // Se o usuário não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated.value) {
    return navigateTo('/admin/login');
  }
});
