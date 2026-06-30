<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-logo-wrapper">
        <NuxtLink to="/" class="auth-logo-link">
          <span class="logo-badge">LR</span>
          <span class="logo-text">La Resenha FC</span>
        </NuxtLink>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// Blank layout for auth pages, no public header/footer
</script>

<style scoped>
.auth-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-background);
  padding: 24px;
}

.auth-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.auth-logo-wrapper {
  display: flex;
  justify-content: center;
}

.auth-logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.logo-badge {
  background-color: var(--color-tertiary);
  color: var(--color-on-tertiary);
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-goal-white);
  border-radius: var(--radius-md);
  box-shadow: 2px 2px 0px var(--color-goal-white);
}

.logo-text {
  font-family: 'Oswald', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-goal-white);
  letter-spacing: 0.05em;
}
</style>
