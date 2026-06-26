<script setup lang="ts">
import type { Categoria } from '@/types/domain'

defineProps<{
  categorias: Categoria[]
  /** id de la categoría seleccionada, o null para "Todas". */
  modelValue: string | null
}>()
defineEmits<{ 'update:modelValue': [value: string | null] }>()
</script>

<template>
  <div class="pills" role="group" aria-label="Filtrar por insumo">
    <button
      class="pill"
      :class="{ 'is-active': modelValue === null }"
      @click="$emit('update:modelValue', null)"
    >
      Todo
    </button>
    <button
      v-for="cat in categorias"
      :key="cat.id"
      class="pill"
      :class="{ 'is-active': modelValue === cat.id }"
      @click="$emit('update:modelValue', cat.id)"
    >
      {{ cat.nombre }}
    </button>
  </div>
</template>

<style scoped>
.pills {
  display: flex;
  gap: var(--sp-2);
  overflow-x: auto;
  padding-bottom: var(--sp-1);
  scrollbar-width: none;
}
.pills::-webkit-scrollbar {
  display: none;
}
.pill {
  flex-shrink: 0;
}
.pill {
  padding: var(--sp-2) var(--sp-4);
  border: 1px solid var(--c-primary-500);
  border-radius: var(--r-md);
  background: var(--c-surface);
  color: var(--c-primary-500);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  cursor: pointer;
  transition:
    background-color 0.15s,
    border-color 0.15s,
    color 0.15s;
}
.pill:hover:not(.is-active) {
  background: var(--c-primary-50);
}
.pill.is-active {
  background: #2563eb;
  border-color: #2563eb;
  color: var(--c-text-invert);
  font-weight: var(--fw-semibold);
}
</style>
