<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import PageHero from '@/components/layout/PageHero.vue'
import { mod, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'
import type { ModModerador } from '@/types/domain'

const { sesion } = useAuth()

const moderadores = ref<ModModerador[]>([])
const cargando = ref(true)
const error = ref('')
const eliminandoId = ref<string | null>(null)
const guardando = ref(false)
const mostrarForm = ref(false)
const formError = ref('')

const nuevo = ref({ nombre: '', email: '', password: '' })

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    moderadores.value = await mod.listarModeradores()
  } catch (e) {
    error.value = e instanceof ApiError ? e.firstMessage : 'No se pudo cargar la lista.'
  } finally {
    cargando.value = false
  }
}

async function eliminar(m: ModModerador) {
  if (!confirm(`¿Eliminar la cuenta de ${m.nombre}? Esta acción no se puede deshacer.`)) return
  eliminandoId.value = m.id
  try {
    await mod.eliminarModerador(m.id)
    moderadores.value = moderadores.value.filter((x) => x.id !== m.id)
  } catch (e) {
    alert(e instanceof ApiError ? e.firstMessage : 'Error al eliminar.')
  } finally {
    eliminandoId.value = null
  }
}

async function agregar() {
  formError.value = ''
  if (!nuevo.value.nombre.trim() || !nuevo.value.email.trim() || !nuevo.value.password) {
    formError.value = 'Todos los campos son requeridos.'
    return
  }
  guardando.value = true
  try {
    const m = await mod.crearModerador({
      nombre: nuevo.value.nombre.trim(),
      email: nuevo.value.email.trim(),
      password: nuevo.value.password,
    })
    moderadores.value.push(m)
    nuevo.value = { nombre: '', email: '', password: '' }
    mostrarForm.value = false
  } catch (e) {
    formError.value = e instanceof ApiError ? e.firstMessage : 'Error al crear moderador.'
  } finally {
    guardando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <div>
    <PageHero title="Moderadores" subtitle="Gestionar cuentas del equipo de moderación" />

    <div class="content page-pad">
      <div class="toolbar">
        <AppButton size="sm" @click="mostrarForm = !mostrarForm">
          {{ mostrarForm ? 'Cancelar' : '+ Agregar moderador' }}
        </AppButton>
      </div>

      <form v-if="mostrarForm" class="form" @submit.prevent="agregar">
        <input v-model="nuevo.nombre" class="field" placeholder="Nombre completo" />
        <input v-model="nuevo.email" class="field" type="email" placeholder="Correo electrónico" />
        <input v-model="nuevo.password" class="field" type="password" placeholder="Contraseña" />
        <p v-if="formError" class="err">{{ formError }}</p>
        <AppButton type="submit" :loading="guardando">Crear moderador</AppButton>
      </form>

      <AppSpinner v-if="cargando" label="Cargando moderadores…" />
      <p v-else-if="error" class="err">{{ error }}</p>

      <ul v-else class="lista">
        <li v-for="m in moderadores" :key="m.id" class="item">
          <div class="item__info">
            <span class="item__nombre">{{ m.nombre }}</span>
            <span class="item__email">{{ m.email }}</span>
          </div>
          <div class="item__acciones">
            <AppBadge tone="success">Activo</AppBadge>
            <AppButton
              size="sm"
              variant="danger"
              :loading="eliminandoId === m.id"
              :disabled="m.email === sesion.nombre"
              @click="eliminar(m)"
            >Eliminar cuenta</AppButton>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.page-pad { padding-block: var(--sp-5) var(--sp-10); display: flex; flex-direction: column; gap: var(--sp-4); }
.err { color: var(--c-danger); font-size: var(--fs-sm); }
.toolbar { display: flex; }
.form { display: flex; flex-direction: column; gap: var(--sp-3); padding: var(--sp-4); background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--r-lg); }
.field { padding: var(--sp-2) var(--sp-3); border: 1px solid var(--c-border); border-radius: var(--r-md); font-size: var(--fs-sm); }
.lista { list-style: none; display: flex; flex-direction: column; gap: var(--sp-3); }
.item {
  padding: var(--sp-4); background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-lg); display: flex; align-items: center; justify-content: space-between; gap: var(--sp-3); flex-wrap: wrap;
}
.item__info { display: flex; flex-direction: column; gap: var(--sp-1); }
.item__nombre { font-weight: var(--fw-semibold); font-size: var(--fs-sm); }
.item__email { font-size: var(--fs-xs); color: var(--c-text-muted); }
.item__acciones { display: flex; align-items: center; gap: var(--sp-2); flex-wrap: wrap; }
</style>
