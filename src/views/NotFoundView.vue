<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const router = useRouter()
</script>

<template>
  <div class="nf container">
    <EmptyState icon="404" title="Página no encontrada" description="La ruta que buscas no existe.">
      <template #action>
        <AppButton @click="router.push({ name: 'home' })">Volver al directorio</AppButton>
      </template>
    </EmptyState>
  </div>
</template>

<style scoped>
.nf {
  padding-block: var(--sp-16);
}
</style>
