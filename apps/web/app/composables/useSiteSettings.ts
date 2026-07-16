import { useState } from '#app';
import { useApi } from '~/composables/useApi';

export interface SiteSettings {
  clubName: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  socialTitle?: string | null;
  socialSubtitle?: string | null;
  instagramUrl?: string | null;
  whatsappNumber?: string | null;
  youtubeUrl?: string | null;
  facebookUrl?: string | null;
}

const DEFAULTS: SiteSettings = { clubName: 'La Resenha FC' };

/**
 * Configurações gerais do site/clube (nome, logo, links...), compartilhadas
 * entre header, footer e páginas. Carregadas uma única vez por sessão.
 */
export const useSiteSettings = () => {
  const settings = useState<SiteSettings>('site-settings', () => ({ ...DEFAULTS }));
  const loaded = useState<boolean>('site-settings-loaded', () => false);
  const { request } = useApi();

  const load = async (force = false) => {
    if (loaded.value && !force) return;
    try {
      const res = await request<any>('/settings');
      const data = res?.data || res;
      if (data?.clubName) {
        settings.value = { ...DEFAULTS, ...data };
        loaded.value = true;
      }
    } catch (error) {
      console.warn('Configurações do site indisponíveis, usando padrão.');
    }
  };

  return { settings, load };
};
