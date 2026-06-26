<script setup lang="ts">
defineProps<{
  label: string
  modelValue: string
  options: { value: string; label: string }[]
  placeholder?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <label class="field">
    <span class="field__label">
      {{ label }}
      <span v-if="required" class="field__req" aria-hidden="true">*</span>
    </span>
    <div class="field__wrap">
      <select
        class="field__select"
        :class="{ 'has-error': error, 'is-placeholder': !modelValue }"
        :value="modelValue"
        :disabled="disabled"
        :aria-invalid="!!error"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ placeholder ?? 'Selecciona una opción' }}</option>
        <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
      <svg class="field__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <span v-if="error" class="field__error">{{ error }}</span>
    <span v-else-if="hint" class="field__hint">{{ hint }}</span>
  </label>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  min-width: 0;
}
.field__label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--c-text);
}
.field__req {
  color: var(--c-danger);
}
.field__wrap {
  position: relative;
}
.field__select {
  width: 100%;
  min-width: 0;
  padding: var(--sp-3) var(--sp-10) var(--sp-3) var(--sp-4);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-lg);
  background: var(--c-surface);
  font-size: var(--fs-base);
  color: var(--c-text);
  appearance: none;
  cursor: pointer;
  transition: border-color 0.15s;
}
.field__select:focus {
  border-color: var(--c-primary-500);
  outline: none;
}
.field__select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.field__select.has-error {
  border-color: var(--c-danger);
}
.field__chevron {
  position: absolute;
  right: var(--sp-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--c-text-faint);
  pointer-events: none;
}
/* Placeholder (sin valor seleccionado) en gris */
.field__select.is-placeholder {
  color: var(--c-text-faint);
}
.field__error {
  font-size: var(--fs-xs);
  color: var(--c-danger);
}
.field__hint {
  font-size: var(--fs-xs);
  color: var(--c-text-faint);
}
</style>
