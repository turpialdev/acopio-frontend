<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import TextField from '@/components/ui/TextField.vue'
import SelectField from '@/components/ui/SelectField.vue'
import PageHero from '@/components/layout/PageHero.vue'
import { mod, ApiError } from '@/api'
import { ESTADOS_VENEZUELA, municipiosDe } from '@/lib/venezuela'
import { computed, watch } from 'vue'

const router = useRouter()

const CARGOS = [
  { value: 'propietario', label: 'Propietario' },
  { value: 'socio', label: 'Socio' },
  { value: 'director', label: 'Director' },
  { value: 'gerente', label: 'Gerente' },
]

const form = reactive({
  nombre: '',
  estado: '',
  municipio: '',
  direccion: '',
  nombre_responsable: '',
  telefono_responsable: '',
  cargo_responsable: '',
})

const opcionesEstado = ESTADOS_VENEZUELA.map((e) => ({ value: e, label: e }))
const opcionesMunicipio = computed(() =>
  municipiosDe(form.estado).map((m) => ({ value: m, label: m })),
)

watch(
  () => form.estado,
  () => { form.municipio = '' },
)

const errores = ref<Record<string, string>>({})
const errorGeneral = ref('')
const enviando = ref(false)

const codigoRaiz = ref('')
const centroId = ref('')
const copiado = ref(false)

async function crear() {
  errores.value = {}
  errorGeneral.value = ''
  if (!form.cargo_responsable) errores.value.cargo_responsable = 'Selecciona un cargo.'
  if (!form.municipio) errores.value.municipio = 'Selecciona un municipio.'
  if (Object.keys(errores.value).length) return

  enviando.value = true
  try {
    const creado = await mod.crearCentro({
      nombre: form.nombre,
      estado: form.estado,
      municipio: form.municipio,
      direccion: form.direccion,
      nombre_responsable: form.nombre_responsable,
      telefono_responsable: form.telefono_responsable,
      cargo_responsable: form.cargo_responsable,
    })
    codigoRaiz.value = creado.codigo_raiz
    centroId.value = creado.id
  } catch (e) {
    if (e instanceof ApiError && e.fields) {
      errores.value = Object.fromEntries(
        Object.entries(e.fields).map(([k, v]) => [k, v[0] ?? '']),
      )
    } else if (e instanceof ApiError) {
      errorGeneral.value = e.firstMessage
    } else {
      errorGeneral.value = 'No se pudo crear el centro.'
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
  } catch { /* ok */ }
}
</script>

<template>
  <div>
    <PageHero title="Crear centro" subtitle="El centro nace verificado. Entrega el código al responsable." />

    <div class="content page-pad">
      <!-- Formulario -->
      <form v-if="!codigoRaiz" class="form" @submit.prevent="crear">
        <fieldset class="section">
          <legend class="section__title">Datos del centro</legend>
          <TextField
            v-model="form.nombre"
            label="Nombre del centro"
            required
            placeholder="Ej: Centro Comunitario La Vega"
            :error="errores.nombre"
          />
          <SelectField
            v-model="form.estado"
            label="Estado"
            required
            placeholder="Selecciona un Estado"
            :options="opcionesEstado"
            :error="errores.estado"
          />
          <SelectField
            v-model="form.municipio"
            label="Municipio"
            required
            :disabled="!form.estado"
            :placeholder="form.estado ? 'Selecciona un Municipio' : 'Selecciona un Estado primero'"
            :options="opcionesMunicipio"
            :error="errores.municipio"
          />
          <TextField
            v-model="form.direccion"
            label="Dirección"
            required
            placeholder="Calle, sector, referencia"
            :error="errores.direccion"
          />
        </fieldset>

        <fieldset class="section">
          <legend class="section__title">Datos del responsable</legend>
          <TextField
            v-model="form.nombre_responsable"
            label="Nombre completo"
            required
            placeholder="Nombre y apellido"
            :error="errores.nombre_responsable"
          />
          <TextField
            v-model="form.telefono_responsable"
            label="Teléfono de contacto"
            required
            placeholder="+58 212 000-0000"
            :error="errores.telefono_responsable"
          />
          <SelectField
            v-model="form.cargo_responsable"
            label="Cargo"
            required
            placeholder="Selecciona un cargo"
            :options="CARGOS"
            :error="errores.cargo_responsable"
          />
        </fieldset>

        <p v-if="errorGeneral" class="err">{{ errorGeneral }}</p>

        <AppButton type="submit" block size="lg" :loading="enviando">Crear centro verificado</AppButton>
        <AppButton variant="ghost" block @click="router.push({ name: 'mod-centros' })">Cancelar</AppButton>
      </form>

      <!-- Código generado -->
      <div v-else class="form">
        <div class="done">
          <h2 class="done__title">Centro creado</h2>
          <p class="done__lead">
            Entrega este código al responsable del centro.
            <strong>No se volverá a mostrar.</strong>
          </p>
          <div class="codigo">
            <code class="codigo__value">{{ codigoRaiz }}</code>
            <AppButton variant="outline" size="sm" @click="copiarCodigo">
              {{ copiado ? 'Copiado ✓' : 'Copiar' }}
            </AppButton>
          </div>
        </div>
        <AppButton block size="lg" @click="router.push({ name: 'mod-centro', params: { id: centroId } })">
          Ver ficha del centro
        </AppButton>
        <AppButton variant="ghost" block @click="router.push({ name: 'mod-centros' })">
          Volver a la lista
        </AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-pad { padding-block: var(--sp-6) var(--sp-10); }
.form { display: flex; flex-direction: column; gap: var(--sp-5); }
.section {
  display: flex; flex-direction: column; gap: var(--sp-4); min-width: 0;
  padding: var(--sp-5); background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-lg); box-shadow: var(--shadow-sm);
}
.section__title {
  padding: 0; font-size: var(--fs-xs); font-weight: var(--fw-bold);
  letter-spacing: 0.06em; text-transform: uppercase; color: var(--c-text-faint);
}
.err { color: var(--c-danger); font-size: var(--fs-sm); }
.done {
  padding: var(--sp-5); background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-lg); box-shadow: var(--shadow-sm);
}
.done__title { font-size: var(--fs-xl); }
.done__lead { margin-top: var(--sp-2); font-size: var(--fs-sm); color: var(--c-text-muted); }
.codigo {
  display: flex; align-items: center; justify-content: space-between; gap: var(--sp-3);
  margin-top: var(--sp-4); padding: var(--sp-4); background: var(--c-primary-50);
  border: 1px dashed var(--c-primary-300); border-radius: var(--r-md);
}
.codigo__value {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: var(--fs-base);
  font-weight: var(--fw-semibold); word-break: break-all; color: var(--c-primary-700);
}
</style>
