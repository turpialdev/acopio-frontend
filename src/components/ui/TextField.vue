<script setup lang="ts">
defineProps<{
  label: string
  modelValue: string
  type?: string
  placeholder?: string
  error?: string
  hint?: string
  autocomplete?: string
  required?: boolean
  maxlength?: number
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
    <input
      class="field__input"
      :class="{ 'has-error': error }"
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      :disabled="disabled"
      :aria-invalid="!!error"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
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
.field__input {
  width: 100%;
  min-width: 0;
  padding: var(--sp-3) var(--sp-4);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-lg);
  background: var(--c-surface);
  font-size: var(--fs-base);
  color: var(--c-text);
  transition: border-color 0.15s;
}
.field__input:focus {
  border-color: var(--c-primary-500);
  outline: none;
}
.field__input.has-error {
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
