<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import TextField from '@/components/ui/TextField.vue'
import SelectField from '@/components/ui/SelectField.vue'
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
  ubicacion_url: '',
  contacto: '',
  horario: '',
  vialidad: '',
  nombre_responsable: '',
  telefono_responsable: '',
  cargo_responsable: '',
})

const opcionesEstado = ESTADOS_VENEZUELA.map((e) => ({ value: e, label: e }))
const opcionesMunicipio = computed(() =>
  municipiosDe(form.estado).map((m) => ({ value: m, label: m })),
)
const opcionesCategoria = ref<{ value: string; label: string }[]>([])

watch(
  () => form.estado,
  () => { form.municipio = '' },
)

const errores = ref<Record<string, string>>({})
const errorGeneral = ref('')
const enviando = ref(false)
const codigoRaiz = ref('')
const copiado = ref(false)

const geolocalizando = ref(false)
const errorGeo = ref('')

function usarUbicacion() {
  if (!navigator.geolocation) {
    errorGeo.value = 'Tu dispositivo no soporta geolocalización.'
    return
  }
  geolocalizando.value = true
  errorGeo.value = ''
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      form.ubicacion_url = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
      geolocalizando.value = false
    },
    () => {
      errorGeo.value = 'No se pudo obtener la ubicación. Verifica los permisos.'
      geolocalizando.value = false
    },
    { timeout: 10000 },
  )
}

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
      ubicacion_url: form.ubicacion_url || undefined,
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
  } catch { /* el usuario puede copiar manualmente */ }
}

onMounted(async () => {
  try {
    const cats = await catalogo.listarCategorias({ es_insumo: true, activa: true })
    opcionesCategoria.value = cats.map((c) => ({ value: c.id, label: c.nombre }))
  } catch { /* sin catálogo el usuario igual puede registrar */ }
})
</script>

<template>
  <div class="page">
    <div class="content wrap">

      <!-- PASO 1: formulario -->
      <template v-if="paso === 'formulario'">
        <!-- Volver -->
        <button class="back" type="button" @click="router.push({ name: 'home' })">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Volver al inicio
        </button>

        <!-- Encabezado -->
        <div class="heading">
          <h1 class="heading__title">Registrar centro de acopio</h1>
          <p class="heading__sub">Completa los datos del centro y del responsable. Recibirás un código secreto para administrarlo.</p>
        </div>

        <form class="form card" @submit.prevent="crear">
          <!-- Datos del centro -->
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
            :error="campoError('direccion')"
          />
          <!-- Link Google Maps con botón de geolocalización -->
          <div class="geo-field">
            <span class="geo-field__label">Link Google Maps</span>
            <div class="geo-field__row">
              <input
                v-model="form.ubicacion_url"
                class="geo-field__input"
                :class="{ 'has-error': campoError('ubicacion_url') || errorGeo }"
                type="text"
                maxlength="500"
                placeholder="https://maps.google.com/…"
                aria-label="Link Google Maps"
              />
              <button
                type="button"
                class="geo-field__btn"
                :disabled="geolocalizando"
                @click="usarUbicacion"
              >
                <svg v-if="!geolocalizando" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="7" r="2.5" stroke="currentColor" stroke-width="1.25"/>
                  <path d="M8 1v1.5M8 11.5V13M1 7h1.5M11.5 7H13" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
                  <path d="M8 11.5C8 11.5 3.5 8.5 3.5 5.5a4.5 4.5 0 0 1 9 0c0 3-4.5 6-4.5 6z" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" class="spin">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" stroke-dasharray="28" stroke-dashoffset="10"/>
                </svg>
                {{ geolocalizando ? 'Localizando…' : 'Mi ubicación' }}
              </button>
            </div>
            <span v-if="campoError('ubicacion_url')" class="geo-field__error">{{ campoError('ubicacion_url') }}</span>
            <span v-else-if="errorGeo" class="geo-field__error">{{ errorGeo }}</span>
            <span v-else class="geo-field__hint">Referencia que permita ubicar el centro físicamente</span>
          </div>
          <TextField
            v-model="form.contacto"
            label="Teléfono del centro (opcional)"
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

          <div class="divider" />

          <!-- Datos del responsable -->
          <TextField
            v-model="form.nombre_responsable"
            label="Nombre del responsable"
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
            label="Rol"
            required
            placeholder="Selecciona tu rol"
            :options="CARGOS"
            :error="campoError('cargo_responsable')"
          />

          <div class="divider" />

          <!-- Necesidades -->
          <div class="needs-header">
            <span class="needs-header__label">Necesidades del centro</span>
            <span class="needs-header__hint">Opcional — puedes agregarlas desde tu panel</span>
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

          <p v-if="errorGeneral" class="form__error">{{ errorGeneral }}</p>

          <AppButton type="submit" block size="lg" class="submit-btn" :loading="enviando">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 2L2 8v10h5v-5h6v5h5V8L10 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>
            Registrar Centro
          </AppButton>
        </form>
      </template>

      <!-- PASO 2: registro exitoso -->
      <template v-else>
        <!-- Volver -->
        <button class="back" type="button" @click="router.push({ name: 'home' })">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Volver al inicio
        </button>

        <div class="done card">
          <!-- Ícono success -->
          <div class="done__icon-wrap">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24.8418 10.8418C25.2974 10.3862 26.0359 10.3862 26.4915 10.8418C26.9471 11.2974 26.9471 12.0359 26.4915 12.4915L17.7415 21.2415C17.2859 21.6971 16.5474 21.6971 16.0918 21.2415L14.3418 19.4915L14.262 19.4027C13.8883 18.9444 13.9147 18.2689 14.3418 17.8418C14.7689 17.4147 15.4444 17.3883 15.9027 17.762L15.9915 17.8418L16.9167 18.7669L24.8418 10.8418ZM20.1751 6.17513C20.6307 5.71952 21.3693 5.71952 21.8249 6.17513C22.2805 6.63074 22.2805 7.36926 21.8249 7.82487L8.99153 20.6582C8.53592 21.1138 7.7974 21.1138 7.34179 20.6582L1.50846 14.8249C1.05285 14.3693 1.05285 13.6307 1.50846 13.1751C1.93559 12.748 2.61109 12.7216 3.06933 13.0954L3.1582 13.1751L8.16666 18.1836L20.1751 6.17513Z" fill="#16A34A"/>
            </svg>
          </div>

          <h2 class="done__title">Registro exitoso</h2>
          <p class="done__lead">Guarda este código para poder administrar tu centro de acopio, es importante que guardes este código.</p>

          <div class="done__field">
            <label class="done__label">Código de tu centro</label>
            <div class="done__input-wrap">
              <input
                class="done__input"
                type="text"
                readonly
                :value="codigoRaiz"
                @click="($event.target as HTMLInputElement).select()"
              />
              <button type="button" class="done__copy" @click="copiarCodigo">
                {{ copiado ? '✓' : 'Copiar' }}
              </button>
            </div>
          </div>

          <button class="done__btn" @click="router.push({ name: 'panel-centro' })">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M15.8333 14.1667C15.8333 13.2462 15.0871 12.5 14.1667 12.5C13.2462 12.5 12.5 13.2462 12.5 14.1667C12.5 15.0871 13.2462 15.8333 14.1667 15.8333C15.0871 15.8333 15.8333 15.0871 15.8333 14.1667ZM5.83333 2.5C7.38881 2.5 8.69466 3.56562 9.0625 5.00651C9.09663 5.00225 9.13139 5 9.16667 5H16.6667C17.1269 5 17.5 5.3731 17.5 5.83333C17.5 6.29357 17.1269 6.66667 16.6667 6.66667H9.16667C9.13135 6.66667 9.09666 6.66361 9.0625 6.65934C8.69493 8.10062 7.38908 9.16667 5.83333 9.16667C3.99238 9.16667 2.5 7.67428 2.5 5.83333C2.5 3.99238 3.99238 2.5 5.83333 2.5ZM17.5 14.1667C17.5 16.0076 16.0076 17.5 14.1667 17.5C12.6135 17.5 11.3083 16.4377 10.9383 15H4.16667C3.70643 15 3.33333 14.6269 3.33333 14.1667C3.33333 13.7064 3.70643 13.3333 4.16667 13.3333H10.9383C11.3083 11.8956 12.6135 10.8333 14.1667 10.8333C16.0076 10.8333 17.5 12.3257 17.5 14.1667ZM4.16667 5.83333C4.16667 6.75381 4.91286 7.5 5.83333 7.5C6.75381 7.5 7.5 6.75381 7.5 5.83333C7.5 4.91286 6.75381 4.16667 5.83333 4.16667C4.91286 4.16667 4.16667 4.91286 4.16667 5.83333Z" fill="white"/>
            </svg>
            Administrar Centro de acopio
          </button>
        </div>
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
.back:hover {
  border-color: #2563eb;
}

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

/* Formulario plano */
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

/* Separador de secciones */
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
.need__remove:hover { background: var(--c-danger-soft); }

.form__error {
  color: var(--c-danger);
  font-size: var(--fs-sm);
}

/* Botón submit */
:deep(.submit-btn) {
  background: #2563eb;
  border-color: #2563eb;
}
:deep(.submit-btn:hover:not(:disabled)) {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

/* Paso 2 */
.done {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-4);
  text-align: center;
}
.done__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: var(--c-success-soft);
  border-radius: var(--r-full);
}
.done__title {
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
}
.done__lead {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
  line-height: 1.5;
}
.done__field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  text-align: left;
}
.done__label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--c-text);
}
.done__req {
  color: var(--c-danger);
  margin-left: 2px;
}
.done__input-wrap {
  display: flex;
  gap: var(--sp-2);
  align-items: center;
}
.done__input {
  flex: 1;
  min-width: 0;
  padding: var(--sp-3) var(--sp-4);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-lg);
  background: var(--c-surface);
  font-size: var(--fs-base);
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  color: var(--c-text);
  cursor: text;
}
.done__input:focus { outline: none; }
.done__copy {
  flex-shrink: 0;
  padding: var(--sp-3) var(--sp-4);
  background: #e6f2fe;
  border: 1px solid transparent;
  border-radius: var(--r-lg);
  color: #2563eb;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: border-color 0.15s;
}
.done__copy:hover { border-color: #2563eb; }
.done__btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  padding: var(--sp-4);
  background: #2563eb;
  border: none;
  border-radius: var(--r-lg);
  color: #fff;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: background 0.15s;
}
.done__btn:hover { background: #1d4ed8; }

/* Campo geolocalización */
.geo-field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  min-width: 0;
}
.geo-field__label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--c-text);
}
.geo-field__row {
  display: flex;
  gap: var(--sp-2);
  align-items: center;
}
.geo-field__input {
  flex: 1;
  min-width: 0;
  padding: var(--sp-3) var(--sp-4);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-lg);
  background: var(--c-surface);
  font-size: var(--fs-base);
  color: var(--c-text);
  transition: border-color 0.15s;
}
.geo-field__input:focus {
  border-color: var(--c-primary-500);
  outline: none;
}
.geo-field__input.has-error { border-color: var(--c-danger); }
.geo-field__btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-3) var(--sp-3);
  background: #e6f2fe;
  border: 1px solid transparent;
  border-radius: var(--r-lg);
  color: #2563eb;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s;
}
.geo-field__btn:hover:not(:disabled) { border-color: #2563eb; }
.geo-field__btn:disabled { opacity: 0.6; cursor: not-allowed; }
.geo-field__error {
  font-size: var(--fs-xs);
  color: var(--c-danger);
}
.geo-field__hint {
  font-size: var(--fs-xs);
  color: var(--c-text-faint);
}
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; transform-origin: center; }
</style>
