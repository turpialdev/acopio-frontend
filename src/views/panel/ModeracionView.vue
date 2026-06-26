<script setup lang="ts">
import { useRouter } from 'vue-router'
import PageHero from '@/components/layout/PageHero.vue'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { sesion } = useAuth()

const ACCIONES = [
  { label: 'Gestionar centros', desc: 'Verificar, ocultar y ver fichas', to: 'mod-centros' },
  { label: 'Crear centro', desc: 'Registrar un nuevo centro verificado', to: 'mod-crear-centro' },
  { label: 'Reportes', desc: 'Atender reportes ciudadanos pendientes', to: 'mod-reportes' },
  { label: 'Administrar categorías', desc: 'Crear y activar categorías del catálogo', to: 'mod-catalogo' },
  { label: 'Administrar moderadores', desc: 'Agregar y eliminar cuentas del equipo', to: 'mod-moderadores' },
  { label: 'Contactos de emergencia', desc: 'Gestionar el directorio de organismos', to: 'mod-contactos' },
  { label: 'Ver métricas', desc: 'Resumen del estado del sistema', to: 'mod-metricas' },
] as const
</script>

<template>
  <div>
    <PageHero
      :title="sesion.nombre ?? 'Moderación'"
      subtitle="Panel de moderación — Acopio Venezuela"
    />

    <div class="content page-pad">
      <section class="acciones">
        <button
          v-for="a in ACCIONES"
          :key="a.to"
          class="accion"
          @click="router.push({ name: a.to })"
        >
          <span class="accion__label">{{ a.label }}</span>
          <span class="accion__desc">{{ a.desc }}</span>
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page-pad { padding-block: var(--sp-5) var(--sp-10); }
.acciones { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-3); }
.accion {
  display: flex; flex-direction: column; gap: var(--sp-1); padding: var(--sp-4);
  text-align: left; background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-lg); box-shadow: var(--shadow-sm); cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.accion:hover { border-color: var(--c-primary-300); box-shadow: var(--shadow-md); }
.accion__label { font-weight: var(--fw-semibold); color: var(--c-primary-700); }
.accion__desc { font-size: var(--fs-xs); color: var(--c-text-muted); }
@media (max-width: 420px) { .acciones { grid-template-columns: 1fr; } }
</style>
