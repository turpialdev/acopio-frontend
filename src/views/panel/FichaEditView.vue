<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import TextField from '@/components/ui/TextField.vue'
import SelectField from '@/components/ui/SelectField.vue'
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
  horario: '',
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

let cargaInicial = true
watch(
  () => form.estado,
  () => { if (!cargaInicial) form.municipio = '' },
)

function agregarNecesidad() {
  necesidades.value.push({ categoria_id: '', urgencia: 'media', detalle: '' })
}
function quitarNecesidad(i: number) {
  necesidades.value.splice(i, 1)
}

function validarTelefono(tel: string): boolean {
  return tel.replace(/\D/g, '').length >= 7
}

async function guardar() {
  const id = sesion.centroId
  if (!id) return

  const errs: Record<string, string> = {}
  if (!form.nombre.trim()) errs.nombre = 'El nombre del centro es requerido.'
  else if (form.nombre.length > 200) errs.nombre = 'No puede superar los 200 caracteres.'
  if (!form.estado) errs.estado = 'Selecciona un estado.'
  if (!form.municipio) errs.municipio = 'Selecciona un municipio.'
  if (!form.direccion.trim()) errs.direccion = 'La dirección es requerida.'
  else if (form.direccion.length > 500) errs.direccion = 'No puede superar los 500 caracteres.'
  if (form.nombre_responsable && form.nombre_responsable.length > 200)
    errs.nombre_responsable = 'No puede superar los 200 caracteres.'
  if (form.telefono_responsable && !validarTelefono(form.telefono_responsable))
    errs.telefono_responsable = 'Ingresa un número de teléfono válido (mínimo 7 dígitos).'
  if (form.telefono_responsable && form.telefono_responsable.length > 50)
    errs.telefono_responsable = 'No puede superar los 50 caracteres.'

  if (Object.keys(errs).length) {
    error.value = Object.values(errs)[0] ?? 'Corrige los errores del formulario.'
    return
  }

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
      horario: form.horario.trim() || null,
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
    form.horario = ficha.horario ?? ''
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
    queueMicrotask(() => (cargaInicial = false))
  }
})
</script>

<template>
  <div class="page">
    <div class="content wrap">
      <AppSpinner v-if="cargando" label="Cargando ficha…" class="spinner" />

      <template v-else>
        <!-- Volver -->
        <button class="back" type="button" @click="router.push({ name: 'panel-centro' })">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Volver al panel
        </button>

        <!-- Encabezado -->
        <div class="heading">
          <h1 class="heading__title">Editar ficha del centro</h1>
          <p class="heading__sub">Actualiza los datos públicos del centro y sus necesidades.</p>
        </div>

        <form class="form card" @submit.prevent="guardar">
          <!-- Datos del centro -->
          <TextField v-model="form.nombre" label="Nombre del centro" required :maxlength="200" />
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
          <TextField v-model="form.direccion" label="Dirección" required :maxlength="500" />
          <TextField
            v-model="form.ubicacion_url"
            label="Link Google Maps"
            placeholder="https://maps.google.com/…"
            :maxlength="500"
          />
          <TextField
            v-model="form.contacto"
            label="Teléfono del centro (opcional)"
            placeholder="0414 1234567"
            :maxlength="100"
          />
          <TextField
            v-model="form.horario"
            label="Horario de trabajo (opcional)"
            placeholder="Ej: Lunes a viernes 8am – 5pm"
            :maxlength="300"
          />
          <TextField
            v-model="form.vialidad"
            label="Vialidad (opcional)"
            placeholder="Acceso por la autopista…"
            :maxlength="300"
          />

          <div class="divider" />

          <!-- Datos del responsable -->
          <TextField v-model="form.nombre_responsable" label="Nombre del responsable" :maxlength="200" />
          <TextField v-model="form.telefono_responsable" label="Teléfono de contacto" :maxlength="50" />
          <SelectField
            v-model="form.cargo_responsable"
            label="Rol"
            placeholder="Selecciona tu rol"
            :options="CARGOS"
          />

          <div class="divider" />

          <!-- Necesidades -->
          <div class="needs-header">
            <span class="needs-header__label">Necesidades del centro</span>
            <span class="needs-header__hint">Los insumos que el centro está solicitando actualmente</span>
          </div>

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
            <button type="button" class="need__remove" @click="quitarNecesidad(i)">Quitar</button>
          </div>

          <AppButton variant="outline" type="button" size="sm" @click="agregarNecesidad">
            + Agregar necesidad
          </AppButton>

          <p v-if="error" class="msg msg--err">{{ error }}</p>
          <p v-if="exito" class="msg msg--ok">✓ Ficha actualizada.</p>

          <AppButton type="submit" block size="lg" class="submit-btn" :loading="guardando">
            Guardar cambios
          </AppButton>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--c-surface);
}
.wrap {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
  padding-block: var(--sp-5) var(--sp-12);
}
.spinner { margin-top: var(--sp-10); }

/* Volver */
.back {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  background: #e6f2fe;
  border: 1px solid transparent;
  border-radius: var(--r-lg);
  color: #2563eb;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  cursor: pointer;
  align-self: flex-start;
}
.back:hover { border-color: #2563eb; }

/* Encabezado */
.heading__title {
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  color: var(--c-text);
}
.heading__sub {
  margin-top: var(--sp-1);
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
  line-height: 1.5;
}

/* Formulario en card */
.form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}
.card {
  padding: var(--sp-5);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-md);
}

/* Divisor */
.divider {
  height: 1px;
  background: var(--c-border);
  margin-block: var(--sp-2);
}

/* Necesidades */
.needs-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.needs-header__label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--c-text);
}
.needs-header__hint {
  font-size: var(--fs-xs);
  color: var(--c-text-faint);
}
.need {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-4);
  background: var(--c-surface-2);
  border-radius: var(--r-lg);
}
.need__grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--sp-3);
  min-width: 0;
}
@media (max-width: 480px) {
  .need__grid { grid-template-columns: 1fr; }
}
.need__remove {
  align-self: flex-end;
  padding: var(--sp-1) var(--sp-3);
  border: 1px solid var(--c-danger);
  border-radius: var(--r-sm);
  background: transparent;
  color: var(--c-danger);
  font-size: var(--fs-sm);
  cursor: pointer;
}
.need__remove:hover { background: var(--c-danger-soft); }

/* Mensajes */
.msg { font-size: var(--fs-sm); }
.msg--err { color: var(--c-danger); }
.msg--ok { color: var(--c-success); font-weight: var(--fw-semibold); }

/* Botón guardar */
:deep(.submit-btn) {
  background: #2563eb;
  border-color: #2563eb;
}
:deep(.submit-btn:hover:not(:disabled)) {
  background: #1d4ed8;
  border-color: #1d4ed8;
}
</style>
