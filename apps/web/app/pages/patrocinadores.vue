<template>
  <div class="sponsors-page container">
    <div class="page-header">
      <h1 class="page-title">Nossos Patrocinadores</h1>
      <p class="page-subtitle">
        Quem veste a camisa junto com a gente. Marcas e parceiros que apoiam o {{ settings.clubName }}.
      </p>
    </div>

    <div v-if="loading" class="state-box">
      <span class="state-ball">⚽</span>
      <p>Carregando patrocinadores...</p>
    </div>

    <div v-else-if="sponsors.length === 0" class="state-box">
      <span class="material-symbols-outlined state-icon">handshake</span>
      <p>Em breve, os parceiros do time aparecerão aqui.</p>
    </div>

    <div v-else class="sponsors-grid">
      <article v-for="sponsor in sponsors" :key="sponsor.id" class="sponsor-card">
        <div class="sponsor-logo-box">
          <img
            v-if="sponsor.logoUrl"
            :src="sponsor.logoUrl"
            :alt="sponsor.name"
            class="sponsor-logo"
          />
          <span v-else class="material-symbols-outlined sponsor-logo-placeholder">handshake</span>
        </div>
        <h2 class="sponsor-name">{{ sponsor.name }}</h2>
        <p v-if="sponsor.description" class="sponsor-desc">{{ sponsor.description }}</p>

        <div v-if="socialLinksOf(sponsor).length > 0" class="sponsor-social">
          <a
            v-for="link in socialLinksOf(sponsor)"
            :key="link.key"
            :href="link.url"
            target="_blank"
            rel="noopener"
            class="sponsor-social-link"
            :title="link.label"
            :aria-label="link.label"
          >
            <svg class="sponsor-social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path :d="SOCIAL_ICONS[link.key]" />
            </svg>
          </a>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useHead, useApi } from '#imports';
import { useSiteSettings } from '~/composables/useSiteSettings';
import { SOCIAL_ICONS, buildSocialLinks } from '~/utils/socialLinks';

useHead({
  title: 'Patrocinadores - La Resenha FC',
  meta: [
    { name: 'description', content: 'Conheça as marcas e parceiros que apoiam o La Resenha FC.' }
  ]
});

interface Sponsor {
  id: number;
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  instagramUrl?: string | null;
  whatsappNumber?: string | null;
  youtubeUrl?: string | null;
  facebookUrl?: string | null;
}

const socialLinksOf = (sponsor: Sponsor) => buildSocialLinks(sponsor);

const { request } = useApi();
const { settings, load: loadSettings } = useSiteSettings();

const sponsors = ref<Sponsor[]>([]);
const loading = ref(true);

const loadSponsors = async () => {
  loading.value = true;
  try {
    const res = await request<any>('/sponsors');
    sponsors.value = Array.isArray(res) ? res : (res?.data || []);
  } catch (error) {
    console.warn('API /sponsors indisponível.');
    sponsors.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadSettings();
  loadSponsors();
});
</script>

<style scoped>
.sponsors-page {
  /* Header fixo (80px) já compensado pelo layout; só o respiro extra aqui. */
  padding-top: 40px;
  padding-bottom: 80px;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 48px;
  border-bottom: 4px dashed var(--color-outline-variant);
  padding-bottom: 24px;
}

.page-title {
  font-family: 'Oswald', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-goal-white);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .page-title {
    font-size: 3.5rem;
  }
}

.page-subtitle {
  font-family: 'Public Sans', sans-serif;
  font-size: 1.125rem;
  color: var(--color-on-surface-variant);
  margin-top: 12px;
  max-width: 700px;
  line-height: 1.5;
}

.sponsors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 28px;
}

.sponsor-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding: 28px 20px;
  background-color: var(--color-surface-container-low);
  border: 4px solid var(--color-outline-variant);
  box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 1);
  border-radius: var(--radius-lg);
  transition: all 0.15s ease;
}

.sponsor-card:hover {
  border-color: var(--color-primary);
  box-shadow: 6px 6px 0px 0px var(--color-primary-container);
}

.sponsor-logo-box {
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 3px solid var(--color-asphalt);
  border-radius: var(--radius-md);
  padding: 14px;
  overflow: hidden;
}

.sponsor-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.sponsor-logo-placeholder {
  font-size: 3rem;
  color: var(--color-outline-variant);
}

.sponsor-name {
  font-family: 'Oswald', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-goal-white);
  margin: 0;
  line-height: 1.15;
}

.sponsor-desc {
  font-family: 'Public Sans', sans-serif;
  font-size: 0.95rem;
  color: var(--color-on-surface-variant);
  margin: 0;
  line-height: 1.5;
}

.sponsor-social {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.sponsor-social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--color-goal-white);
  border: 2px solid var(--color-outline-variant);
  border-radius: var(--radius-sm);
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 1);
  transition: all 0.1s ease;
}

.sponsor-social-link:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0px rgba(0, 0, 0, 1);
}

.sponsor-social-icon {
  width: 18px;
  height: 18px;
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: var(--color-surface-container-low);
  border: 4px dashed var(--color-outline-variant);
  border-radius: var(--radius-lg);
  text-align: center;
  color: var(--color-on-surface-variant);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.2rem;
  gap: 12px;
}

.state-icon {
  font-size: 3rem;
  color: var(--color-outline-variant);
}

.state-ball {
  font-size: 3rem;
  animation: spin 1.5s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
