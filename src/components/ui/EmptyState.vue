<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  description?: string
  tone?: 'neutral' | 'error'
}>()
</script>

<template>
  <div class="empty" :class="{ 'empty--error': tone === 'error' }">
    <div class="empty__icon" aria-hidden="true">{{ icon ?? '∅' }}</div>
    <h3 class="empty__title">{{ title }}</h3>
    <p v-if="description" class="empty__desc">{{ description }}</p>
    <div v-if="$slots.action" class="empty__action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--sp-2);
  padding: var(--sp-12) var(--sp-5);
  color: var(--c-text-muted);
}
.empty__icon {
  font-size: 2rem;
  line-height: 1;
  margin-bottom: var(--sp-2);
}
.empty--error .empty__icon {
  color: var(--c-danger);
}
.empty__title {
  font-size: var(--fs-lg);
  color: var(--c-text);
}
.empty__desc {
  max-width: 36ch;
  font-size: var(--fs-sm);
}
.empty__action {
  margin-top: var(--sp-3);
}
</style>
