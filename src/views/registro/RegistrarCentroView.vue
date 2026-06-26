<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import TextField from '@/components/ui/TextField.vue'
import SelectField from '@/components/ui/SelectField.vue'
import PageHero from '@/components/layout/PageHero.vue'
import IconPersonAdd from '@/components/icons/IconPersonAdd.vue'
import { auth as authApi, catalogo, centros as centrosApi, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'
import { ESTADOS_VENEZUELA, municipiosDe } from '@/lib/venezuela'
import type { CargoResponsable, Urgencia } from '@/types/domain'

const router = useRouter()
const { iniciarSesionCodigo } = useAuth()

type Paso = 'formulario' | 'codigo'
const paso = ref<Paso>('formulario')

const CARGOS: { value: CargoResponsable; label: string }[] = [
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

interface FilaNecesidad {
  categoria_id: string
  urgencia: Urgencia
  detalle: string
}
const necesidadesForm = ref<FilaNecesidad[]>([])

function agregarNecesidad() {
  necesidadesForm.value.push({ categoria_id: '', urgencia: 'media', detalle: '' })
}
function quitarNecesidad(i: number) {
  necesidadesForm.value.splice(i, 1)
}

const form = reactive({
  nombre: '',
  estado: '',
  municipio: '',
  direccion: '',
  contacto: '',
  horario: '',
  vialidad: '',
  nombre_responsable: '',
  telefono_responsable: '',
  cargo_responsable: '',
})

// Opciones para los selects.
const opcionesEstado = ESTADOS_VENEZUELA.map((e) => ({ value: e, label: e }))
const opcionesMunicipio = computed(() =>
  municipiosDe(form.estado).map((m) => ({ value: m, label: m })),
)
const opcionesCategoria = ref<{ value: string; label: string }[]>([])

// Al cambiar de estado, el municipio previo deja de ser válido.
watch(
  () => form.estado,
  () => {
    form.municipio = ''
  },
)

const errores = ref<Record<string, string>>({})
const errorGeneral = ref('')
const enviando = ref(false)

// Resultado del registro.
const codigoRaiz = ref('')
const copiado = ref(false)

function campoError(campo: string): string {
  return errores.value[campo] ?? ''
}

function validarTelefono(tel: string): boolean {
  return tel.replace(/\D/g, '').length >= 7
}

async function crear() {
  errores.value = {}
  errorGeneral.value = ''

  if (!form.nombre.trim()) errores.value.nombre = 'El nombre del centro es requerido.'
  else if (form.nombre.length > 200) errores.value.nombre = 'No puede superar los 200 caracteres.'

  if (!form.estado) errores.value.estado = 'Selecciona un estado.'
  if (!form.municipio) errores.value.municipio = 'Selecciona un municipio.'

  if (!form.direccion.trim()) errores.value.direccion = 'La dirección es requerida.'
  else if (form.direccion.length > 500) errores.value.direccion = 'No puede superar los 500 caracteres.'

  if (!form.nombre_responsable.trim())
    errores.value.nombre_responsable = 'El nombre del responsable es requerido.'
  else if (form.nombre_responsable.length > 200)
    errores.value.nombre_responsable = 'No puede superar los 200 caracteres.'

  if (!form.telefono_responsable.trim())
    errores.value.telefono_responsable = 'El teléfono de contacto es requerido.'
  else if (!validarTelefono(form.telefono_responsable))
    errores.value.telefono_responsable = 'Ingresa un número de teléfono válido (mínimo 7 dígitos).'
  else if (form.telefono_responsable.length > 50)
    errores.value.telefono_responsable = 'No puede superar los 50 caracteres.'

  if (!form.cargo_responsable) errores.value.cargo_responsable = 'Selecciona un cargo.'

  if (Object.keys(errores.value).length) return

  enviando.value = true
  try {
    const filasValidas = necesidadesForm.value.filter((f) => f.categoria_id)
    const creado = await centrosApi.crearCentro({
      nombre: form.nombre,
      estado: form.estado,
      municipio: form.municipio,
      direccion: form.direccion,
      contacto: form.contacto || undefined,
      horario: form.horario || undefined,
      vialidad: form.vialidad || undefined,
      nombre_responsable: form.nombre_responsable,
      telefono_responsable: form.telefono_responsable,
      cargo_responsable: form.cargo_responsable as CargoResponsable,
      necesidades: filasValidas.map((f) => ({
        categoria_id: f.categoria_id,
        urgencia: f.urgencia,
        detalle: f.detalle || undefined,
      })),
    })
    codigoRaiz.value = creado.codigo_raiz

    // Canjear el código raíz por un JWT.
    const sesion = await authApi.loginConCodigo(creado.codigo_raiz)
    iniciarSesionCodigo({
      token: sesion.token,
      rol: sesion.rol,
      centroId: sesion.centro_id,
      etiqueta: sesion.etiqueta,
    })

    paso.value = 'codigo'
  } catch (e) {
    if (e instanceof ApiError && e.fields) {
      errores.value = Object.fromEntries(
        Object.entries(e.fields).map(([k, v]) => [k, v[0] ?? '']),
      )
    } else if (e instanceof ApiError) {
      errorGeneral.value = e.firstMessage
    } else {
      errorGeneral.value = 'No se pudo registrar el centro.'
    }
  } finally {
    enviando.value = false
  }
}

async function copiarCodigo() {
  try {
    await navigator.clipboard.writeText(codigoRaiz.value)
    copiado.value = true
    setTimeout(() => (copiado.value = false), 2000)
  } catch {
    /* el usuario puede copiar manualmente */
  }
}

onMounted(async () => {
  try {
    const cats = await catalogo.listarCategorias({ es_insumo: true, activa: true })
    opcionesCategoria.value = cats.map((c) => ({ value: c.id, label: c.nombre }))
  } catch {
    /* sin catálogo el usuario igual puede registrar */
  }
})
</script>

<template>
  <div>
    <PageHero
      title="Registrar Centro"
      subtitle="No necesitas contraseña. Recibirás un Código Raíz para acceder."
    >
      <template #icon><IconPersonAdd /></template>
    </PageHero>

    <div class="content page-pad">
      <!-- PASO 1: formulario -->
      <form v-if="paso === 'formulario'" class="form" @submit.prevent="crear">
        <fieldset class="section">
          <legend class="section__title">Datos del centro</legend>
          <TextField
            v-model="form.nombre"
            label="Nombre del centro"
            required
            :maxlength="200"
            placeholder="Ej: Centro Comunitario La Vega"
            :error="campoError('nombre')"
          />
          <SelectField
            v-model="form.estado"
            label="Estado"
            required
            placeholder="Selecciona un Estado"
            :options="opcionesEstado"
            :error="campoError('estado')"
          />
          <SelectField
            v-model="form.municipio"
            label="Municipio"
            required
            :disabled="!form.estado"
            :placeholder="form.estado ? 'Selecciona un Municipio' : 'Selecciona un Estado primero'"
            :options="opcionesMunicipio"
            :error="campoError('municipio')"
          />
          <TextField
            v-model="form.direccion"
            label="Dirección"
            required
            :maxlength="500"
            placeholder="Calle, sector, referencia"
            hint="Referencia que permita ubicar el centro físicamente"
            :error="campoError('direccion')"
          />
          <TextField
            v-model="form.contacto"
            label="Teléfono (opcional)"
            :maxlength="100"
            placeholder="+58 212 000-0000"
            :error="campoError('contacto')"
          />
          <TextField
            v-model="form.horario"
            label="Horario de trabajo (opcional)"
            :maxlength="300"
            placeholder="Ej: Lunes a viernes 8am – 5pm"
            :error="campoError('horario')"
          />
          <TextField
            v-model="form.vialidad"
            label="Vialidad (opcional)"
            :maxlength="300"
            placeholder="Ej: Acceso por vía principal, sin restricciones"
            :error="campoError('vialidad')"
          />
        </fieldset>

        <fieldset class="section">
          <legend class="section__title">Datos del responsable</legend>
          <TextField
            v-model="form.nombre_responsable"
            label="Nombre completo"
            required
            :maxlength="200"
            placeholder="Nombre y apellido"
            :error="campoError('nombre_responsable')"
          />
          <TextField
            v-model="form.telefono_responsable"
            label="Teléfono de contacto"
            required
            :maxlength="50"
            placeholder="+58 212 000-0000"
            :error="campoError('telefono_responsable')"
          />
          <SelectField
            v-model="form.cargo_responsable"
            label="Cargo"
            required
            placeholder="Selecciona tu cargo"
            :options="CARGOS"
            :error="campoError('cargo_responsable')"
          />
        </fieldset>

        <!-- Necesidades del centro -->
        <fieldset class="section">
          <legend class="section__title">Necesidades del centro</legend>

          <div v-if="!necesidadesForm.length" class="needs-empty">
            Aún no agregaste ninguna necesidad. Puedes agregarlas ahora o hacerlo más tarde desde tu
            panel.
          </div>

          <div v-for="(fila, i) in necesidadesForm" :key="i" class="need">
            <div class="need__grid">
              <SelectField
                v-model="fila.categoria_id"
                label="Insumo"
                placeholder="Selecciona un insumo"
                :options="opcionesCategoria"
              />
              <SelectField
                v-model="fila.urgencia"
                label="Urgencia"
                :options="URGENCIAS"
              />
            </div>
            <TextField
              v-model="fila.detalle"
              label="Detalle (opcional)"
              :maxlength="200"
              placeholder="Ej: Preferiblemente en lata"
            />
            <button type="button" class="need__remove" @click="quitarNecesidad(i)">
              Quitar
            </button>
          </div>

          <AppButton type="button" variant="outline" size="sm" @click="agregarNecesidad">
            + Agregar necesidad
          </AppButton>
        </fieldset>

        <p v-if="errorGeneral" class="form__error">{{ errorGeneral }}</p>

        <AppButton type="submit" block size="lg" :loading="enviando">Registrar Centro</AppButton>
      </form>

      <!-- PASO 2: código raíz -->
      <div v-else class="form">
        <div class="done">
          <h2 class="done__title">¡Centro registrado!</h2>
          <p class="done__lead">
            Guarda este código en un lugar seguro. Es la llave de acceso de tu centro y
            <strong>no se volverá a mostrar</strong>.
          </p>
          <div class="codigo">
            <code class="codigo__value">{{ codigoRaiz }}</code>
            <AppButton variant="outline" size="sm" @click="copiarCodigo">
              {{ copiado ? 'Copiado ✓' : 'Copiar' }}
            </AppButton>
          </div>
        </div>
        <AppButton block size="lg" @click="router.push({ name: 'panel-centro' })">
          Ir a mi panel
        </AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-pad {
  padding-block: var(--sp-6) var(--sp-10);
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
.form__error {
  color: var(--c-danger);
  font-size: var(--fs-sm);
}

/* Necesidades */
.needs-empty {
  padding: var(--sp-3) var(--sp-4);
  border: 1px dashed var(--c-border);
  border-radius: var(--r-md);
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
  text-align: center;
  line-height: 1.5;
}
.need {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-4);
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
}
.need__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);
  min-width: 0;
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
.need__remove:hover {
  background: var(--c-danger-soft);
}

/* Paso 2 */
.done {
  padding: var(--sp-5);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
}
.done__title {
  font-size: var(--fs-xl);
}
.done__lead {
  margin-top: var(--sp-2);
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}
.codigo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  margin-top: var(--sp-4);
  padding: var(--sp-4);
  background: var(--c-primary-50);
  border: 1px dashed var(--c-primary-300);
  border-radius: var(--r-md);
}
.codigo__value {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  word-break: break-all;
  color: var(--c-primary-700);
}
</style>
