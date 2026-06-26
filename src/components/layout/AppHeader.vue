<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { estaAutenticado, esModerador, esResponsable, esVoluntario, sesion, cerrarSesion } =
  useAuth()

const menuAbierto = ref(false)

/** Destino del panel según el tipo de sesión. */
function centroDestino() {
  if (esResponsable.value) return { name: 'panel-centro' }
  if (esVoluntario.value) return { name: 'inventario' }
  if (esModerador.value) return { name: 'moderacion' }
  return { name: 'home' }
}

function salir() {
  cerrarSesion()
  menuAbierto.value = false
  router.push({ name: 'home' })
}
</script>

<template>
  <header class="header">
    <div class="container header__inner">
      <RouterLink :to="{ name: 'home' }" class="brand" @click="menuAbierto = false">
        <span class="brand__mark" aria-hidden="true">◆</span>
        <span class="brand__text">
          <strong>Acopio</strong>
          <small>Venezuela</small>
        </span>
      </RouterLink>

      <!-- Sesión activa -->
      <div v-if="estaAutenticado" class="header__actions">
        <RouterLink :to="centroDestino()" class="header__session">
          <span class="header__role">
            {{ esModerador ? 'Moderador' : esResponsable ? 'Responsable' : 'Voluntario' }}
          </span>
          <span class="header__name">{{ sesion.nombre ?? sesion.etiqueta ?? 'Mi panel' }}</span>
        </RouterLink>
        <AppButton variant="ghost" size="sm" @click="salir">Salir</AppButton>
      </div>

      <!-- Sin sesión: tres accesos -->
      <nav v-else class="header__actions" :class="{ 'is-open': menuAbierto }">
        <AppButton variant="primary" size="sm" @click="router.push({ name: 'registrar' })">
          Registrar centro
        </AppButton>
        <AppButton variant="secondary" size="sm" @click="router.push({ name: 'acceder' })">
          Tengo un código
        </AppButton>
        <AppButton variant="ghost" size="sm" @click="router.push({ name: 'moderador' })">
          Moderador
        </AppButton>
      </nav>

      <button class="header__burger" aria-label="Menú" @click="menuAbierto = !menuAbierto">
        ☰
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
}
.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-h);
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  color: var(--c-text);
}
.brand:hover {
  text-decoration: none;
}
.brand__mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--r-md);
  background: var(--c-primary-500);
  color: var(--c-text-invert);
  font-size: 0.9rem;
}
.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}
.brand__text strong {
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
}
.brand__text small {
  font-size: var(--fs-xs);
  color: var(--c-text-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.header__actions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}
.header__session {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.1;
  color: var(--c-text);
}
.header__session:hover {
  text-decoration: none;
}
.header__role {
  font-size: var(--fs-xs);
  color: var(--c-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.header__name {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
}

.header__burger {
  display: none;
  border: none;
  background: transparent;
  font-size: 1.4rem;
  cursor: pointer;
}

@media (max-width: 720px) {
  .header__burger {
    display: block;
  }
  .header__actions {
    position: absolute;
    top: var(--header-h);
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: var(--sp-2);
    padding: var(--sp-4);
    background: var(--c-surface);
    border-bottom: 1px solid var(--c-border);
    box-shadow: var(--shadow-md);
    display: none;
  }
  .header__actions.is-open {
    display: flex;
  }
  /* La sesión activa siempre visible aunque colapse el menú. */
  .header__actions:not(nav) {
    position: static;
    flex-direction: row;
    padding: 0;
    box-shadow: none;
    border: none;
    background: transparent;
    display: flex;
  }
}
</style>
