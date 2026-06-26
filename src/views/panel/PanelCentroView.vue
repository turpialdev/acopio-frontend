<script setup lang="ts">
import PanelPlaceholder from '@/components/layout/PanelPlaceholder.vue'
</script>

<template>
  <PanelPlaceholder
    title="Panel del centro"
    description="Aquí el responsable gestiona la ficha, las necesidades, el inventario y los códigos de voluntarios."
    :features="[
      'Editar ficha pública del centro',
      'Gestionar necesidades y urgencias',
      'Inventario de movimientos',
      'Sugerencias del inventario',
      'Emitir códigos para voluntarios',
    ]"
  />
</template>
