<script setup lang="ts">
import EmptyState from '@/components/ui/EmptyState.vue'

defineProps<{
  title: string
  description: string
  features: string[]
}>()
</script>

<template>
  <div class="placeholder container">
    <EmptyState icon="🚧" :title="title" :description="description" />
    <ul class="placeholder__list">
      <li v-for="f in features" :key="f">{{ f }}</li>
    </ul>
  </div>
</template>

<style scoped>
.placeholder {
  padding-block: var(--sp-10);
  max-width: 560px;
}
.placeholder__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  margin: 0 auto;
  max-width: 360px;
}
.placeholder__list li {
  padding: var(--sp-3) var(--sp-4);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}
.placeholder__list li::before {
  content: '○ ';
  color: var(--c-primary-500);
}
</style>
