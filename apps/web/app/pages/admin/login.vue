<template>
  <div class="login-container">
    <VCard variant="featured" class="login-card">
      <div class="login-header">
        <div class="login-brand">
          <img v-if="settings.logoUrl" :src="settings.logoUrl" :alt="settings.clubName" class="login-logo" />
          <span class="login-club">{{ settings.clubName }}</span>
        </div>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">E-mail</label>
          <input 
            id="email"
            v-model="form.email"
            type="email"
            placeholder="seu.email@exemplo.com"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">Senha</label>
          <input 
            id="password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
            class="form-input"
          />
        </div>

        <label class="remember-row">
          <input type="checkbox" v-model="rememberMe" class="remember-check" />
          <span>Lembrar de mim (manter conectado)</span>
        </label>

        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <VButton
          type="submit" 
          variant="primary" 
          :disabled="loading"
          class="submit-button"
        >
          {{ loading ? 'Entrando...' : 'Acessar Painel' }}
        </VButton>
      </form>

      <div class="login-footer">
        <NuxtLink to="/" class="back-link">← Voltar para o início</NuxtLink>
      </div>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useHead, definePageMeta } from '#imports';
import { useAuth } from '~/composables/useAuth';
import { useSiteSettings } from '~/composables/useSiteSettings';
import VCard from '~/components/ui/VCard.vue';
import VButton from '~/components/ui/VButton.vue';

// Define o layout de autenticação e o middleware de convidados (guest)
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
});

useHead({
  title: 'Entrar - Painel La Resenha FC',
});

const { login } = useAuth();
const { settings, load: loadSettings } = useSiteSettings();

// "Lembrar de mim": mantém o cookie de autenticação persistente (~30 dias)
const rememberMe = ref(false);

const form = reactive({
  email: '',
  password: ''
});

onMounted(() => {
  loadSettings();
});

const loading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';

  const result = await login({
    email: form.email,
    password: form.password,
    rememberMe: rememberMe.value
  });

  loading.value = false;

  if (!result.success) {
    errorMessage.value = result.error || 'Erro inesperado ao realizar login.';
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
}

.login-card {
  max-width: 450px;
  width: 100%;
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.login-logo {
  width: 72px;
  height: 72px;
  object-fit: contain;
  border-radius: 50%;
  border: 3px solid var(--color-outline-variant);
  background-color: var(--color-surface-container-low);
}

.login-club {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  color: var(--color-tertiary);
  line-height: 1.1;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  text-transform: uppercase;
  color: var(--color-primary);
  letter-spacing: 0.03em;
}

.form-input {
  background-color: var(--color-deep-space);
  border: var(--border-width-regular) solid var(--color-asphalt);
  border-radius: var(--radius-sm);
  color: var(--color-goal-white);
  padding: 12px 16px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 4px 4px 0px var(--color-primary);
}

.remember-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-goal-white);
  cursor: pointer;
  user-select: none;
}

.remember-check {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.error-banner {
  background-color: rgba(239, 68, 68, 0.15);
  border: var(--border-width-regular) solid var(--color-error);
  color: var(--color-error);
  padding: 12px;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  text-align: center;
  font-weight: 500;
}

.submit-button {
  width: 100%;
  margin-top: 8px;
}

.login-footer {
  text-align: center;
  margin-top: 32px;
}

.back-link {
  color: var(--color-goal-white);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: var(--color-primary);
  text-decoration: underline;
}
</style>
