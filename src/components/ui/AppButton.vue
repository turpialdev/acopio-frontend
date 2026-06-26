<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'light' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    block?: boolean
    type?: 'button' | 'submit'
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    block: false,
    type: 'button',
    disabled: false,
    loading: false,
  },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--block': block, 'is-loading': loading }]"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  border: 1px solid transparent;
  border-radius: var(--r-md);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition:
    background-color 0.15s,
    border-color 0.15s,
    transform 0.05s;
  white-space: nowrap;
}
.btn:active:not(:disabled) {
  transform: translateY(1px);
}
.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.btn--block {
  width: 100%;
}

.btn--sm {
  padding: var(--sp-1) var(--sp-3);
  font-size: var(--fs-sm);
}
.btn--md {
  padding: var(--sp-2) var(--sp-4);
  font-size: var(--fs-sm);
}
.btn--lg {
  padding: var(--sp-3) var(--sp-5);
  font-size: var(--fs-base);
}

.btn--primary {
  background: var(--c-primary-500);
  color: var(--c-text-invert);
}
.btn--primary:hover:not(:disabled) {
  background: var(--c-primary-600);
}

.btn--secondary {
  background: var(--c-surface);
  border-color: var(--c-border-strong);
  color: var(--c-text);
}
.btn--secondary:hover:not(:disabled) {
  background: var(--c-surface-2);
}

.btn--ghost {
  background: transparent;
  color: var(--c-text-muted);
}
.btn--ghost:hover:not(:disabled) {
  background: var(--c-surface-2);
  color: var(--c-text);
}

.btn--danger {
  background: var(--c-danger);
  color: var(--c-text-invert);
}

/* Fondo blanco, texto azul — usado sobre el panel azul (Buscar/Limpiar). */
.btn--light {
  background: var(--c-surface);
  color: var(--c-primary-600);
}
.btn--light:hover:not(:disabled) {
  background: var(--c-primary-50);
}

/* Contorno azul — usado para "Ver Contactos", "Llamar" en contactos. */
.btn--outline {
  background: var(--c-surface);
  border-color: var(--c-primary-500);
  color: var(--c-primary-600);
}
.btn--outline:hover:not(:disabled) {
  background: var(--c-primary-50);
}

.btn__spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: btn-spin 0.6s linear infinite;
}
@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
