<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import TextField from '@/components/ui/TextField.vue'
import SelectField from '@/components/ui/SelectField.vue'
import PageHero from '@/components/layout/PageHero.vue'
import IconPersonAdd from '@/components/icons/IconPersonAdd.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import { catalogo, centros as centrosApi, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'
import { ESTADOS_VENEZUELA, municipiosDe } from '@/lib/venezuela'
import type { CargoResponsable, NecesidadInput, Urgencia } from '@/types/domain'

const router = useRouter()
const { sesion } = useAuth()

const CARGOS: { value: string; label: string }[] = [
  { value: 'propietario', label: 'Propietario' },
  { value: 'socio', label: 'Socio' },
  { value: 'director', label: 'Director' },
  { value: 'gerente', label: 'Gerente' },
]
const URGENCIAS: { value: string; label: string }[] = [
  { value: 'urgente', label: 'Urgente' },
  { value: 'media', label: 'Media' },
  { value: 'leve', label: 'Leve' },
]

const form = reactive({
  nombre: '',
  estado: '',
  municipio: '',
  direccion: '',
  contacto: '',
  ubicacion_url: '',
  vialidad: '',
  nombre_responsable: '',
  telefono_responsable: '',
  cargo_responsable: '',
})

interface FilaNecesidad {
  categoria_id: string
  urgencia: Urgencia
  detalle: string
}
const necesidades = ref<FilaNecesidad[]>([])
const opcionesCategoria = ref<{ value: string; label: string }[]>([])
const opcionesEstado = ESTADOS_VENEZUELA.map((e) => ({ value: e, label: e }))
const opcionesMunicipio = computed(() =>
  municipiosDe(form.estado).map((m) => ({ value: m, label: m })),
)

const cargando = ref(true)
const guardando = ref(false)
const error = ref('')
const exito = ref(false)

// Sólo resetea el municipio si el usuario cambia el estado tras la carga inicial.
let cargaInicial = true
watch(
  () => form.estado,
  () => {
    if (!cargaInicial) form.municipio = ''
  },
)

function agregarNecesidad() {
  necesidades.value.push({ categoria_id: '', urgencia: 'media', detalle: '' })
}
function quitarNecesidad(i: number) {
  necesidades.value.splice(i, 1)
}

async function guardar() {
  const id = sesion.centroId
  if (!id) return
  guardando.value = true
  error.value = ''
  exito.value = false
  try {
    const necesidadesValidas: NecesidadInput[] = necesidades.value
      .filter((n) => n.categoria_id)
      .map((n) => ({
        categoria_id: n.categoria_id,
        urgencia: n.urgencia,
        detalle: n.detalle.trim() || null,
      }))
    await centrosApi.actualizarFicha(id, {
      nombre: form.nombre,
      estado: form.estado,
      municipio: form.municipio,
      direccion: form.direccion,
      contacto: form.contacto.trim() || null,
      ubicacion_url: form.ubicacion_url.trim() || null,
      vialidad: form.vialidad.trim() || null,
      nombre_responsable: form.nombre_responsable.trim() || null,
      telefono_responsable: form.telefono_responsable.trim() || null,
      cargo_responsable: (form.cargo_responsable || null) as CargoResponsable | null,
      necesidades: necesidadesValidas,
    })
    exito.value = true
    setTimeout(() => (exito.value = false), 3000)
  } catch (e) {
    error.value = e instanceof ApiError ? e.firstMessage : 'No se pudo guardar la ficha.'
  } finally {
    guardando.value = false
  }
}

onMounted(async () => {
  const id = sesion.centroId
  if (!id) {
    error.value = 'Sesión sin centro asociado.'
    cargando.value = false
    return
  }
  try {
    const [ficha, cats] = await Promise.all([
      centrosApi.obtenerFicha(id),
      catalogo.listarCategorias({ es_insumo: true, activa: true }),
    ])
    opcionesCategoria.value = cats.map((c) => ({ value: c.id, label: c.nombre }))
    form.nombre = ficha.nombre
    form.estado = ficha.estado
    form.municipio = ficha.municipio
    form.direccion = ficha.direccion
    form.contacto = ficha.contacto ?? ''
    form.ubicacion_url = ficha.ubicacion_url ?? ''
    form.vialidad = ficha.vialidad ?? ''
    form.nombre_responsable = ficha.nombre_responsable ?? ''
    form.telefono_responsable = ficha.telefono_responsable ?? ''
    form.cargo_responsable = ficha.cargo_responsable ?? ''
    necesidades.value = ficha.necesidades.map((n) => ({
      categoria_id: n.categoria_id,
      urgencia: n.urgencia,
      detalle: n.detalle ?? '',
    }))
  } catch (e) {
    error.value = e instanceof ApiError ? e.firstMessage : 'No se pudo cargar la ficha.'
  } finally {
    cargando.value = false
    // Permite que el watch de estado reaccione a cambios posteriores del usuario.
    queueMicrotask(() => (cargaInicial = false))
  }
})
</script>

<template>
  <div>
    <PageHero title="Editar ficha" subtitle="Datos públicos del centro y necesidades.">
      <template #icon><IconPersonAdd /></template>
    </PageHero>

    <div class="content page-pad">
      <AppSpinner v-if="cargando" label="Cargando ficha…" />

      <form v-else class="form" @submit.prevent="guardar">
        <fieldset class="section">
          <legend class="section__title">Datos del centro</legend>
          <TextField v-model="form.nombre" label="Nombre del centro" required />
          <SelectField
            v-model="form.estado"
            label="Estado"
            required
            placeholder="Selecciona un Estado"
            :options="opcionesEstado"
          />
          <SelectField
            v-model="form.municipio"
            label="Municipio"
            required
            :disabled="!form.estado"
            placeholder="Selecciona un Municipio"
            :options="opcionesMunicipio"
          />
          <TextField v-model="form.direccion" label="Dirección" required />
          <TextField v-model="form.contacto" label="Contacto (teléfono)" placeholder="0414 1234567" />
          <TextField
            v-model="form.ubicacion_url"
            label="Enlace de ubicación (Maps)"
            placeholder="https://maps.google.com/…"
          />
          <TextField
            v-model="form.vialidad"
            label="Vialidad / cómo llegar"
            placeholder="Acceso por la autopista…"
          />
        </fieldset>

        <fieldset class="section">
          <legend class="section__title">Datos del responsable</legend>
          <TextField v-model="form.nombre_responsable" label="Nombre completo" />
          <TextField v-model="form.telefono_responsable" label="Teléfono de contacto" />
          <SelectField
            v-model="form.cargo_responsable"
            label="Cargo"
            placeholder="Selecciona tu cargo"
            :options="CARGOS"
          />
        </fieldset>

        <fieldset class="section">
          <legend class="section__title">Necesidades</legend>
          <p v-if="!necesidades.length" class="empty">Aún no has agregado necesidades.</p>
          <div v-for="(n, i) in necesidades" :key="i" class="need">
            <div class="need__grid">
              <SelectField
                v-model="n.categoria_id"
                label="Insumo"
                placeholder="Categoría"
                :options="opcionesCategoria"
              />
              <SelectField v-model="n.urgencia" label="Urgencia" :options="URGENCIAS" />
            </div>
            <TextField v-model="n.detalle" label="Detalle (opcional)" placeholder="Ej: en botellas" />
            <button type="button" class="need__remove" @click="quitarNecesidad(i)">
              Quitar
            </button>
          </div>
          <AppButton variant="outline" type="button" @click="agregarNecesidad">
            + Agregar necesidad
          </AppButton>
        </fieldset>

        <p v-if="error" class="msg msg--err">{{ error }}</p>
        <p v-if="exito" class="msg msg--ok">✓ Ficha actualizada.</p>

        <div class="actions">
          <AppButton variant="ghost" type="button" @click="router.push({ name: 'panel-centro' })">
            Volver
          </AppButton>
          <AppButton type="submit" size="lg" :loading="guardando">Guardar cambios</AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-pad {
  padding-block: var(--sp-5) var(--sp-10);
}
.form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}
.section {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  min-width: 0;
  padding: var(--sp-5);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
}
.section__title {
  padding: 0;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-text-faint);
}
.empty {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}
.need {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-4);
  background: var(--c-surface-2);
  border-radius: var(--r-md);
}
.need__grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--sp-3);
}
.need__remove {
  align-self: flex-end;
  border: none;
  background: transparent;
  color: var(--c-danger);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  cursor: pointer;
}
.actions {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-3);
}
.msg {
  font-size: var(--fs-sm);
}
.msg--err {
  color: var(--c-danger);
}
.msg--ok {
  color: var(--c-success);
  font-weight: var(--fw-semibold);
}
</style>
