<template>
  <div class="image-upload">
    <div class="image-upload__row">
      <!-- Prévia -->
      <div class="image-upload__preview" :class="{ 'image-upload__preview--empty': !modelValue }">
        <img v-if="modelValue" :src="modelValue" :alt="label" class="image-upload__img" />
        <span v-else class="material-symbols-outlined image-upload__placeholder">image</span>
      </div>

      <!-- Ações -->
      <div class="image-upload__actions">
        <input
          :id="inputId"
          ref="fileInput"
          type="file"
          accept="image/*"
          class="image-upload__input"
          @change="onFileChange"
        />
        <label :for="inputId" class="image-upload__btn" :class="{ 'image-upload__btn--disabled': uploading }">
          {{ uploading ? 'Enviando...' : (modelValue ? 'Trocar imagem' : 'Escolher imagem') }}
        </label>
        <button
          v-if="modelValue && !uploading"
          type="button"
          class="image-upload__remove"
          @click="clearImage"
        >
          Remover
        </button>
      </div>
    </div>

    <p v-if="uploading" class="image-upload__status">Enviando imagem, aguarde...</p>
    <p v-else-if="error" class="image-upload__status image-upload__status--error">{{ error }}</p>
    <p v-else class="image-upload__hint">Formatos de imagem (JPG, PNG, WEBP...). Máx. 5 MB.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useApi } from '~/composables/useApi';

const props = defineProps<{
  modelValue: string;
  label?: string;
  folderHint?: string;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const { request } = useApi();

const fileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const error = ref('');

// id único para o par input/label (permite vários uploads na mesma tela)
const inputId = computed(() => `img-upload-${Math.random().toString(36).slice(2, 9)}`);

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  error.value = '';

  if (!file.type.startsWith('image/')) {
    error.value = 'Selecione um arquivo de imagem.';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'A imagem excede o limite de 5 MB.';
    return;
  }

  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', file);
    // Não define Content-Type: o navegador cuida do boundary do multipart
    const res = await request<any>('/uploads', { method: 'POST', body: formData });
    const url = res?.data?.url || res?.url;
    if (!url) throw new Error('Resposta inválida do servidor.');
    emit('update:modelValue', url);
  } catch (e: any) {
    const apiMsg = e?.data?.message;
    error.value = (Array.isArray(apiMsg) ? apiMsg[0] : apiMsg) || 'Falha ao enviar a imagem.';
  } finally {
    uploading.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const clearImage = () => {
  emit('update:modelValue', '');
  error.value = '';
};
</script>

<style scoped>
.image-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-upload__row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.image-upload__preview {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-outline-variant);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-container-low);
  box-shadow: 2px 2px 0px var(--color-asphalt);
  overflow: hidden;
}

.image-upload__preview--empty {
  border-style: dashed;
}

.image-upload__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-upload__placeholder {
  font-size: 2rem;
  color: var(--color-outline-variant);
}

.image-upload__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.image-upload__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  overflow: hidden;
}

.image-upload__btn {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  background-color: var(--color-primary);
  color: var(--color-on-primary, #000);
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  cursor: pointer;
  box-shadow: 2px 2px 0px var(--color-asphalt);
  transition: all 0.1s ease;
}

.image-upload__btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0px var(--color-asphalt);
}

.image-upload__btn--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-upload__remove {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  background: transparent;
  color: var(--color-error-red);
  border: none;
  cursor: pointer;
}

.image-upload__remove:hover {
  text-decoration: underline;
}

.image-upload__hint {
  font-size: 0.85rem;
  color: #a3a3a3;
  margin: 0;
}

.image-upload__status {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-primary);
}

.image-upload__status--error {
  color: var(--color-error-red);
}
</style>
