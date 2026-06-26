<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: 'Cargando…' })
</script>

<template>
  <div class="spinner" role="status">
    <span class="spinner__ring" aria-hidden="true" />
    <span class="spinner__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-10);
  color: var(--c-text-muted);
}
.spinner__ring {
  width: 28px;
  height: 28px;
  border: 3px solid var(--c-border);
  border-top-color: var(--c-primary-500);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.spinner__label {
  font-size: var(--fs-sm);
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
