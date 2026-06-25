<template>
  <div class="welcome-section">
    <!-- Base Neobrutalist Card Component -->
    <VCard variant="featured" class="welcome-card">
      <div class="status-badge">🟢 ESTRUTURA CONFIGURADA</div>
      <h1>La Resenha FC</h1>
      <p class="subtitle">
        A estrutura base do **Nuxt 4** foi reconstruída do zero com sucesso!
      </p>
      
      <div class="features-list">
        <div class="feature-item">
          <strong>📂 Estrutura Limpa:</strong> Diretórios organizados seguindo as diretrizes oficiais do Nuxt 4.
        </div>
        <div class="feature-item">
          <strong>🧱 Componentes Reutilizáveis:</strong> Botões (`VButton`) e Cards (`VCard`) integrados ao Design System.
        </div>
        <div class="feature-item">
          <strong>🛡️ Autenticação SSR-Safe:</strong> Sessões armazenadas em cookies com guards de rotas (`auth` e `guest` middlewares).
        </div>
        <div class="feature-item">
          <strong>🌐 Cliente de API Inteligente:</strong> `useApi` pronto para se comunicar com o backend NestJS de forma automática.
        </div>
      </div>

      <div class="welcome-actions">
        <VButton variant="primary" @click="testApiCall">
          Testar Conexão com API
        </VButton>
        <VButton to="/admin" variant="outline">
          Acessar Painel Admin (Protegido)
        </VButton>
      </div>

      <!-- Feedback Area -->
      <div v-if="apiStatus" :class="['api-feedback', { 'feedback-success': apiSuccess, 'feedback-error': !apiSuccess }]">
        {{ apiStatus }}
      </div>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useHead, useApi } from '#imports';
import VCard from '~/components/ui/VCard.vue';
import VButton from '~/components/ui/VButton.vue';

// SEO Meta details
useHead({
  title: 'La Resenha FC - Estrutura Base Nuxt 4',
  meta: [
    { name: 'description', content: 'Estrutura do frontend do projeto La Resenha FC reconstruída com sucesso.' }
  ]
});

const { request } = useApi();
const apiStatus = ref('');
const apiSuccess = ref(false);

const testApiCall = async () => {
  apiStatus.value = 'Conectando à API...';
  apiSuccess.value = false;
  
  try {
    // Tenta acessar o endpoint público de saúde da API
    // Se não houver endpoint de saúde, a chamada padrão para '/' funciona na maioria das APIs NestJS
    const response = await request<{ message?: string } | string>('/');
    apiSuccess.value = true;
    apiStatus.value = '⚡ Conexão com a API NestJS realizada com sucesso!';
  } catch (error: any) {
    apiSuccess.value = false;
    apiStatus.value = `❌ Falha ao conectar com a API: ${error.message || 'Sem resposta do servidor (localhost:3001)'}`;
  }
};
</script>

<style scoped>
.welcome-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.welcome-card {
  max-width: 680px;
  width: 100%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.status-badge {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  background-color: var(--color-asphalt);
  color: var(--color-primary);
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  margin-bottom: 24px;
  border: 1px solid var(--color-primary);
  letter-spacing: 0.05em;
}

h1 {
  font-size: 3.5rem;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 1.25rem;
  color: var(--color-goal-white);
  margin-bottom: 32px;
}

.features-list {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: rgba(9, 9, 9, 0.4);
  border: var(--border-width-regular) solid var(--color-asphalt);
  border-radius: var(--radius-md);
  padding: 24px;
  margin-bottom: 32px;
  width: 100%;
}

.feature-item {
  font-size: 1rem;
  line-height: 1.5;
  color: #e5e5e5;
}

.welcome-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.api-feedback {
  margin-top: 24px;
  padding: 12px 20px;
  border: var(--border-width-regular) solid var(--color-asphalt);
  border-radius: var(--radius-default);
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  width: 100%;
  text-align: center;
}

.feedback-success {
  background-color: rgba(74, 222, 128, 0.15);
  border-color: var(--color-vibrant-turf);
  color: var(--color-vibrant-turf);
}

.feedback-error {
  background-color: rgba(239, 68, 68, 0.15);
  border-color: var(--color-error);
  color: var(--color-error);
}
</style>
