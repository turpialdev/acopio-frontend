<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'success' | 'neutral' | 'danger' | 'warning' | 'primary'
    /** Color directo (token CSS var name, ej "--c-urgente"). Tiene prioridad. */
    colorVar?: string
    dot?: boolean
  }>(),
  { tone: 'neutral', dot: false },
)
</script>

<template>
  <span
    class="badge"
    :class="`badge--${tone}`"
    :style="colorVar ? { color: `var(${colorVar})`, background: 'transparent', borderColor: `var(${colorVar})` } : undefined"
  >
    <span v-if="dot" class="badge__dot" :style="colorVar ? { background: `var(${colorVar})` } : undefined" />
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: 2px var(--sp-2);
  border: 1px solid transparent;
  border-radius: var(--r-full);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  line-height: 1.4;
  white-space: nowrap;
}
.badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.badge--success {
  color: var(--c-success);
  background: var(--c-success-soft);
}
.badge--neutral {
  color: var(--c-text-muted);
  background: var(--c-surface-2);
}
.badge--danger {
  color: var(--c-danger);
  background: var(--c-danger-soft);
}
.badge--warning {
  color: var(--c-warning);
  background: var(--c-warning-soft);
}
.badge--primary {
  color: var(--c-primary-700);
  background: var(--c-primary-100);
}
</style>
