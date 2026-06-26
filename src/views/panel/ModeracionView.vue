<script setup lang="ts">
import PanelPlaceholder from '@/components/layout/PanelPlaceholder.vue'
</script>

<template>
  <PanelPlaceholder
    title="Panel de moderación"
    description="Cola de trabajo del equipo: verificar centros, atender reportes y gestionar contactos de emergencia."
    :features="[
      'Verificar / ocultar centros',
      'Atender reportes pendientes',
      'Gestionar contactos de emergencia',
    ]"
  />
</template>
