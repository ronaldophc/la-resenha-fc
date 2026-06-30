import { defineNuxtPlugin } from '#app';
import { useAuth } from '../composables/useAuth';

export default defineNuxtPlugin(async (nuxtApp) => {
  const { fetchUser, token } = useAuth();

  // Executa o fetch do perfil apenas se o token de autenticação estiver presente nos cookies.
  // Isso funciona de maneira idêntica no Server (SSR) e no Client.
  if (token.value) {
    await fetchUser();
  }
});
