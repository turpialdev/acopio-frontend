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
    <select
      class="field__select"
      :class="{ 'has-error': error }"
      :value="modelValue"
      :disabled="disabled"
      :aria-invalid="!!error"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">{{ placeholder ?? 'Selecciona una opción' }}</option>
      <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
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
.field__select {
  width: 100%;
  min-width: 0;
  padding: var(--sp-3);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-md);
  background: var(--c-surface);
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
.field__error {
  font-size: var(--fs-xs);
  color: var(--c-danger);
}
.field__hint {
  font-size: var(--fs-xs);
  color: var(--c-text-faint);
}
</style>
