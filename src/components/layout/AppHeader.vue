<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import { useAuth } from '@/composables/useAuth'
import lepLogo from '@/assets/lep-logo.png'

const router = useRouter()
const { estaAutenticado, esModerador, esResponsable, esVoluntario, sesion, cerrarSesion } =
  useAuth()

/** Destino del panel según el tipo de sesión. */
function centroDestino() {
  if (esResponsable.value) return { name: 'panel-centro' }
  if (esVoluntario.value) return { name: 'inventario' }
  if (esModerador.value) return { name: 'moderacion' }
  return { name: 'home' }
}

function salir() {
  cerrarSesion()
  router.push({ name: 'home' })
}
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <RouterLink :to="{ name: 'home' }" class="brand">
        <img :src="lepLogo" alt="LEP — Liga Empresarial en Pro" class="brand__logo" />
        <span class="brand__check" aria-hidden="true">✓</span>
        <span class="brand__name">Acopio Venezuela</span>
      </RouterLink>

      <div v-if="estaAutenticado" class="header__session">
        <RouterLink :to="centroDestino()" class="header__role">
          {{ esModerador ? 'Moderador' : esResponsable ? 'Responsable' : 'Voluntario' }}
        </RouterLink>
        <AppButton variant="light" size="sm" @click="salir">Salir</AppButton>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: var(--c-primary-800);
  color: var(--c-text-invert);
}
.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  min-height: var(--header-h);
  max-width: var(--container);
  margin: 0 auto;
  padding: var(--sp-2) var(--sp-4);
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-3);
  color: var(--c-text-invert);
}
.brand:hover {
  text-decoration: none;
}
.brand__logo {
  height: 38px;
  width: auto;
  object-fit: contain;
}
.brand__check {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--c-success);
  color: #fff;
  font-size: 0.7rem;
  font-weight: var(--fw-bold);
}
.brand__name {
  font-family: var(--font-sans);
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
}
.header__session {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.header__role {
  color: var(--c-text-invert);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
}

@media (max-width: 420px) {
  .brand__name {
    font-size: var(--fs-lg);
  }
}
</style>
