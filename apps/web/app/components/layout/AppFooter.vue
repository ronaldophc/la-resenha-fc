<template>
  <footer class="app-footer">
    <div class="container footer-container">
      <div class="footer-grid">
        <!-- Brand Info -->
        <div class="footer-brand">
          <h4>La Resenha FC</h4>
          <p>O clube mais temido da várzea curitibana. Futebol jogado na raça, poeira no pulmão e resenha garantida com cerveja gelada.</p>
        </div>
        
        <!-- Quick Links -->
        <div class="footer-links">
          <h5>Navegação</h5>
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li><NuxtLink to="/elenco">Elenco</NuxtLink></li>
            <li><NuxtLink to="/resultados">Resultados</NuxtLink></li>
            <li><NuxtLink to="/tabela">Classificação</NuxtLink></li>
          </ul>
        </div>
        
        <!-- Admin Entry -->
        <div class="footer-admin">
          <h5>Administração</h5>
          <p>Área restrita para a comissão técnica e diretoria do La Resenha FC.</p>
          <VButton
            :to="isAuthenticated ? '/admin' : '/admin/login'"
            variant="outline"
            size="sm"
          >
            {{ isAuthenticated ? 'Acessar Painel' : 'Área do Diretor' }}
          </VButton>
        </div>
      </div>
    </div>
    
    <!-- Footer Bottom -->
    <div class="footer-bottom">
      <div class="container">
        <p>© {{ currentYear }} La Resenha FC. Todos os direitos reservados. UTFPR - Tópicos Especiais em Programação.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuth } from '#imports';
import VButton from '~/components/ui/VButton.vue';

const { isAuthenticated } = useAuth();
const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.app-footer {
  background-color: #0e0e0e;
  border-top: var(--border-width-thick) solid var(--color-asphalt);
  padding: 48px 0 0 0;
  margin-top: auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  padding-bottom: 40px;
}

@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: 2fr 1fr 2fr;
  }
}

.footer-brand h4, .footer-links h5, .footer-admin h5 {
  color: var(--color-goal-white);
  margin-bottom: 16px;
  font-size: 1.25rem;
}

.footer-brand p, .footer-admin p {
  font-size: 0.95rem;
  color: #a3a3a3;
  margin-bottom: 16px;
  line-height: 1.6;
}

.footer-links ul {
  list-style: none;
}

.footer-links li {
  margin-bottom: 8px;
}

.footer-links a {
  color: #a3a3a3;
  font-size: 0.95rem;
  text-decoration: none;
}

.footer-links a:hover {
  color: var(--color-primary);
}

.footer-bottom {
  background-color: var(--color-asphalt);
  padding: 20px 0;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-bottom p {
  margin: 0;
  font-size: 0.85rem;
  color: #737373;
}
</style>
