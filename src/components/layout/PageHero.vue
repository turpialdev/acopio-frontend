<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <section class="hero">
    <div class="content hero__inner">
      <h1 class="hero__title">
        <span v-if="$slots.icon" class="hero__icon"><slot name="icon" /></span>
        {{ title }}
      </h1>
      <p v-if="subtitle" class="hero__sub">{{ subtitle }}</p>
      <div v-if="$slots.default" class="hero__extra"><slot /></div>
    </div>
  </section>
</template>

<style scoped>
/* Mismo navy que la cabecera: se ve como una sola franja azul. */
.hero {
  background: var(--c-primary-800);
  color: var(--c-text-invert);
}
.hero__inner {
  padding-block: var(--sp-5) var(--sp-6);
}
.hero__title {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  color: var(--c-text-invert);
  font-size: var(--fs-2xl);
}
.hero__icon {
  display: inline-flex;
  width: 1.4em;
  height: 1.4em;
  flex-shrink: 0;
}
.hero__icon :deep(svg) {
  width: 100%;
  height: 100%;
}
.hero__sub {
  margin-top: var(--sp-2);
  max-width: 46ch;
  color: rgba(255, 255, 255, 0.78);
  font-size: var(--fs-sm);
}
.hero__extra {
  margin-top: var(--sp-4);
}
</style>
