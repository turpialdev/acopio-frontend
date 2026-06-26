<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import TextField from '@/components/ui/TextField.vue'
import SelectField from '@/components/ui/SelectField.vue'
import PageHero from '@/components/layout/PageHero.vue'
import IconPersonAdd from '@/components/icons/IconPersonAdd.vue'
import { auth as authApi, catalogo, centros as centrosApi, necesidades, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'
import { ESTADOS_VENEZUELA, municipiosDe } from '@/lib/venezuela'
import type { CargoResponsable } from '@/types/domain'

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

const form = reactive({
  nombre: '',
  estado: '',
  municipio: '',
  categoria_principal: '',
  direccion: '',
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

async function crear() {
  // Validación de campos que no son del centro (no los valida el backend).
  errores.value = {}
  errorGeneral.value = ''
  if (!form.categoria_principal) errores.value.categoria_principal = 'Selecciona una categoría.'
  if (!form.cargo_responsable) errores.value.cargo_responsable = 'Selecciona un cargo.'
  if (!form.municipio) errores.value.municipio = 'Selecciona un municipio.'
  if (Object.keys(errores.value).length) return

  enviando.value = true
  try {
    const creado = await centrosApi.crearCentro({
      nombre: form.nombre,
      estado: form.estado,
      municipio: form.municipio,
      direccion: form.direccion,
      nombre_responsable: form.nombre_responsable,
      telefono_responsable: form.telefono_responsable,
      cargo_responsable: form.cargo_responsable as CargoResponsable,
    })
    codigoRaiz.value = creado.codigo_raiz

    // Canjear el código raíz por un JWT y registrar la necesidad principal.
    const sesion = await authApi.loginConCodigo(creado.codigo_raiz)
    iniciarSesionCodigo({
      token: sesion.token,
      rol: sesion.rol,
      centroId: sesion.centro_id,
      etiqueta: sesion.etiqueta,
    })
    try {
      await necesidades.crearNecesidad({
        centro_id: creado.id,
        categoria_id: form.categoria_principal,
        urgencia: 'media',
      })
    } catch {
      /* la necesidad es secundaria; no bloquea el registro */
    }

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
          <SelectField
            v-model="form.categoria_principal"
            label="Categoría principal"
            required
            placeholder="Tipo de insumos que reciben"
            :options="opcionesCategoria"
            :error="campoError('categoria_principal')"
          />
          <TextField
            v-model="form.direccion"
            label="Dirección"
            required
            placeholder="Calle, sector, referencia"
            hint="Referencia que permita ubicar el centro físicamente"
            :error="campoError('direccion')"
          />
        </fieldset>

        <fieldset class="section">
          <legend class="section__title">Datos del responsable</legend>
          <TextField
            v-model="form.nombre_responsable"
            label="Nombre completo"
            required
            placeholder="Nombre y apellido"
            :error="campoError('nombre_responsable')"
          />
          <TextField
            v-model="form.telefono_responsable"
            label="Teléfono de contacto"
            required
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
