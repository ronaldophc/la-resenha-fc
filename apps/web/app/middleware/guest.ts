import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useAuth } from '../composables/useAuth';

export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth();

  // Se o usuário já estiver autenticado, redireciona para a área administrativa
  if (isAuthenticated.value) {
    return navigateTo('/admin');
  }
});
