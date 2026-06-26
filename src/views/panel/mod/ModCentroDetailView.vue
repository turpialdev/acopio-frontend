<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import { mod, ApiError } from '@/api'
import type { Ficha } from '@/types/domain'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const centro = ref<Ficha | null>(null)
const cargando = ref(true)
const error = ref('')
const codigoNuevo = ref('')
const guardando = ref(false)

// Fusión
const fusionando = ref(false)
const idFusion = ref('')
const fusionError = ref('')

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    centro.value = await mod.obtenerCentro(id)
  } catch (e) {
    error.value = e instanceof ApiError ? e.firstMessage : 'No se pudo cargar el centro.'
  } finally {
    cargando.value = false
  }
}

async function verificar() {
  guardando.value = true
  try {
    centro.value = await mod.verificarCentro(id)
  } catch (e) {
    alert(e instanceof ApiError ? e.firstMessage : 'Error al verificar.')
  } finally {
    guardando.value = false
  }
}

async function ocultar() {
  if (!confirm('¿Ocultar este centro del directorio público?')) return
  guardando.value = true
  try {
    centro.value = await mod.ocultarCentro(id)
  } catch (e) {
    alert(e instanceof ApiError ? e.firstMessage : 'Error al ocultar.')
  } finally {
    guardando.value = false
  }
}

async function reemitirCodigo() {
  if (!confirm('Se revocará el código raíz actual. ¿Continuar?')) return
  guardando.value = true
  try {
    const res = await mod.reemitirCodigo(id)
    codigoNuevo.value = res.codigo_raiz
  } catch (e) {
    alert(e instanceof ApiError ? e.firstMessage : 'Error al reemitir.')
  } finally {
    guardando.value = false
  }
}

async function fusionar() {
  fusionError.value = ''
  if (!idFusion.value.trim()) {
    fusionError.value = 'Ingresa el ID del centro duplicado.'
    return
  }
  if (!confirm(`¿Fusionar este centro con el ID "${idFusion.value}"? Esta acción no se puede deshacer.`)) return
  guardando.value = true
  try {
    await mod.fusionarCentros(id, idFusion.value.trim(), id)
    alert('Centros fusionados. El duplicado fue eliminado.')
    router.push({ name: 'mod-centros' })
  } catch (e) {
    fusionError.value = e instanceof ApiError ? e.firstMessage : 'Error al fusionar.'
  } finally {
    guardando.value = false
  }
}

const badgeTone = (ev: string) =>
  ev === 'verificado' ? 'success' : ev === 'oculto' ? 'danger' : 'neutral'

onMounted(cargar)
</script>

<template>
  <div>
    <div class="topbar">
      <button class="back" @click="router.back()">← Volver</button>
    </div>

    <div class="content page-pad">
      <AppSpinner v-if="cargando" label="Cargando centro…" />
      <p v-else-if="error" class="err">{{ error }}</p>

      <template v-else-if="centro">
        <div class="header">
          <h1 class="nombre">{{ centro.nombre }}</h1>
          <AppBadge :tone="badgeTone(centro.estado_verificacion)">
            {{ centro.estado_verificacion.replace('_', ' ') }}
          </AppBadge>
        </div>

        <section class="seccion">
          <p class="dato"><span class="dato__label">Estado / Municipio</span>{{ centro.estado }}, {{ centro.municipio }}</p>
          <p class="dato"><span class="dato__label">Dirección</span>{{ centro.direccion }}</p>
          <p v-if="centro.contacto" class="dato"><span class="dato__label">Contacto</span>{{ centro.contacto }}</p>
          <p v-if="centro.vialidad" class="dato"><span class="dato__label">Vialidad</span>{{ centro.vialidad }}</p>
          <p v-if="centro.nombre_responsable" class="dato">
            <span class="dato__label">Responsable</span>{{ centro.nombre_responsable }} ({{ centro.cargo_responsable }})
          </p>
          <p v-if="centro.telefono_responsable" class="dato">
            <span class="dato__label">Tel. responsable</span>{{ centro.telefono_responsable }}
          </p>
          <p class="dato"><span class="dato__label">Actualizado</span>{{ new Date(centro.actualizado_en).toLocaleDateString('es-VE') }}</p>
        </section>

        <section v-if="centro.necesidades?.length" class="seccion">
          <h2 class="seccion__titulo">Insumos requeridos</h2>
          <div class="tags">
            <AppBadge
              v-for="n in centro.necesidades"
              :key="n.id"
              :tone="n.urgencia === 'urgente' ? 'danger' : n.urgencia === 'media' ? 'warning' : 'neutral'"
            >
              {{ n.categoria_nombre }}
            </AppBadge>
          </div>
        </section>

        <!-- Acciones principales -->
        <section class="seccion acciones">
          <AppButton
            v-if="centro.estado_verificacion !== 'verificado'"
            :loading="guardando"
            @click="verificar"
          >Verificar</AppButton>
          <AppButton
            v-if="centro.estado_verificacion !== 'oculto'"
            variant="secondary"
            :loading="guardando"
            @click="ocultar"
          >Ocultar</AppButton>
        </section>

        <!-- Código nuevo mostrado tras reemitir -->
        <section v-if="codigoNuevo" class="seccion codigo-nuevo">
          <p class="codigo-nuevo__label">Código raíz nuevo (entregar al responsable):</p>
          <p class="codigo-nuevo__valor">{{ codigoNuevo }}</p>
          <p class="codigo-nuevo__nota">Solo se muestra una vez.</p>
        </section>

        <section class="seccion">
          <h2 class="seccion__titulo">Rescatar código raíz</h2>
          <p class="hint">Revoca el código activo y genera uno nuevo.</p>
          <AppButton variant="secondary" size="sm" :loading="guardando" @click="reemitirCodigo">
            Reemitir código
          </AppButton>
        </section>

        <!-- Fusionar duplicado -->
        <section class="seccion">
          <h2 class="seccion__titulo">Fusionar con duplicado</h2>
          <p class="hint">Este centro quedará conservado; el duplicado será eliminado.</p>
          <div class="fusion-form">
            <input
              v-model="idFusion"
              class="fusion-input"
              placeholder="ID del centro duplicado"
              :class="{ 'fusion-input--error': fusionError }"
            />
            <AppButton variant="danger" size="sm" :loading="guardando" @click="fusionar">
              Fusionar
            </AppButton>
          </div>
          <p v-if="fusionError" class="err">{{ fusionError }}</p>
          <p class="hint hint--danger">⚠ Esta acción es irreversible.</p>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.topbar { padding: var(--sp-3) var(--sp-4); border-bottom: 1px solid var(--c-border); }
.back { background: none; border: none; cursor: pointer; color: var(--c-primary-600); font-size: var(--fs-sm); }
.page-pad { padding-block: var(--sp-5) var(--sp-10); display: flex; flex-direction: column; gap: var(--sp-5); }
.err { color: var(--c-danger); font-size: var(--fs-sm); }
.header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--sp-3); }
.nombre { font-size: var(--fs-xl, 1.25rem); font-weight: var(--fw-bold); }
.seccion { display: flex; flex-direction: column; gap: var(--sp-2); }
.seccion__titulo { font-size: var(--fs-base); font-weight: var(--fw-semibold); }
.dato { font-size: var(--fs-sm); display: flex; flex-direction: column; gap: 2px; }
.dato__label { font-size: var(--fs-xs); color: var(--c-text-faint); text-transform: uppercase; letter-spacing: 0.04em; }
.tags { display: flex; flex-wrap: wrap; gap: var(--sp-2); }
.acciones { flex-direction: row; flex-wrap: wrap; }
.hint { font-size: var(--fs-xs); color: var(--c-text-muted); }
.hint--danger { color: var(--c-danger); }
.fusion-form { display: flex; gap: var(--sp-2); align-items: center; }
.fusion-input {
  flex: 1; padding: var(--sp-2) var(--sp-3); border: 1px solid var(--c-border);
  border-radius: var(--r-md); font-size: var(--fs-sm);
}
.fusion-input--error { border-color: var(--c-danger); }
.codigo-nuevo {
  background: var(--c-success-soft, #f0fdf4); border: 1px solid var(--c-success);
  border-radius: var(--r-md); padding: var(--sp-4);
}
.codigo-nuevo__label { font-size: var(--fs-xs); color: var(--c-text-muted); }
.codigo-nuevo__valor { font-size: var(--fs-lg); font-weight: var(--fw-bold); font-family: monospace; letter-spacing: 0.1em; }
.codigo-nuevo__nota { font-size: var(--fs-xs); color: var(--c-danger); }
</style>
