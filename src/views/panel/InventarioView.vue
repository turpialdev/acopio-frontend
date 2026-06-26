<script setup lang="ts">
import PanelPlaceholder from '@/components/layout/PanelPlaceholder.vue'
</script>

<template>
  <PanelPlaceholder
    title="Inventario de movimientos"
    description="Libro de entradas y salidas de insumos del centro (voluntario y responsable)."
    :features="[
      'Registrar entrada / salida',
      'Historial agrupado por día',
      'Corregir movimientos recientes',
    ]"
  />
</template>
