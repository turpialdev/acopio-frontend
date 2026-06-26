<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import TextField from '@/components/ui/TextField.vue'
import { auth as authApi, catalogo, centros as centrosApi, necesidades, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'
import type { CargoResponsable, Categoria, Urgencia } from '@/types/domain'

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
  direccion: '',
  nombre_responsable: '',
  telefono_responsable: '',
  cargo_responsable: 'director' as CargoResponsable,
})

const errores = ref<Record<string, string>>({})
const errorGeneral = ref('')
const enviando = ref(false)

// Resultado del paso 1
const codigoRaiz = ref('')
const centroId = ref('')
const copiado = ref(false)

// Necesidad principal (opcional)
const categorias = ref<Categoria[]>([])
const categoriaSel = ref('')
const urgenciaSel = ref<Urgencia>('media')
const guardandoNecesidad = ref(false)

function campoError(campo: string): string {
  return errores.value[campo] ?? ''
}

async function crear() {
  enviando.value = true
  errores.value = {}
  errorGeneral.value = ''
  try {
    const creado = await centrosApi.crearCentro({ ...form })
    codigoRaiz.value = creado.codigo_raiz
    centroId.value = creado.id

    // Canjear el código raíz por un JWT para poder crear la necesidad.
    const sesion = await authApi.loginConCodigo(creado.codigo_raiz)
    iniciarSesionCodigo({
      token: sesion.token,
      rol: sesion.rol,
      centroId: sesion.centro_id,
      etiqueta: sesion.etiqueta,
    })

    paso.value = 'codigo'
    // Cargar categorías para la necesidad principal opcional.
    catalogo
      .listarCategorias({ es_insumo: true, activa: true })
      .then((c) => (categorias.value = c))
      .catch(() => {})
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

async function finalizar() {
  // Si eligió una categoría principal, registra la necesidad.
  if (categoriaSel.value) {
    guardandoNecesidad.value = true
    try {
      await necesidades.crearNecesidad({
        centro_id: centroId.value,
        categoria_id: categoriaSel.value,
        urgencia: urgenciaSel.value,
      })
    } catch {
      /* no bloqueamos el flujo si falla la necesidad opcional */
    } finally {
      guardandoNecesidad.value = false
    }
  }
  router.push({ name: 'panel-centro' })
}
</script>

<template>
  <div class="reg container">
    <!-- PASO 1: formulario -->
    <form v-if="paso === 'formulario'" class="reg__card" @submit.prevent="crear">
      <header class="reg__head">
        <h1 class="reg__title">Registrar centro de acopio</h1>
        <p class="reg__lead">
          Crea la ficha pública de tu centro. Al terminar recibirás un código de acceso
          <strong>que se muestra una sola vez</strong>.
        </p>
      </header>

      <div class="reg__grid">
        <TextField
          v-model="form.nombre"
          label="Nombre del centro"
          required
          :error="campoError('nombre')"
          placeholder="Centro Comunitario La Vega"
        />
        <TextField
          v-model="form.direccion"
          label="Dirección"
          required
          :error="campoError('direccion')"
          placeholder="Calle 5, sector Los Pinos"
        />
        <TextField
          v-model="form.estado"
          label="Estado"
          required
          :error="campoError('estado')"
          placeholder="Miranda"
        />
        <TextField
          v-model="form.municipio"
          label="Municipio"
          required
          :error="campoError('municipio')"
          placeholder="Libertador"
        />
        <TextField
          v-model="form.nombre_responsable"
          label="Nombre del responsable"
          required
          :error="campoError('nombre_responsable')"
        />
        <TextField
          v-model="form.telefono_responsable"
          label="Teléfono del responsable"
          required
          :error="campoError('telefono_responsable')"
          placeholder="+58 212 000-0000"
        />
        <label class="field">
          <span class="field__label">Cargo del responsable</span>
          <select v-model="form.cargo_responsable" class="field__select">
            <option v-for="c in CARGOS" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </label>
      </div>

      <p v-if="errorGeneral" class="reg__error">{{ errorGeneral }}</p>

      <div class="reg__actions">
        <AppButton variant="ghost" @click="router.push({ name: 'home' })">Cancelar</AppButton>
        <AppButton type="submit" size="lg" :loading="enviando">Registrar centro</AppButton>
      </div>
    </form>

    <!-- PASO 2: código raíz + necesidad principal -->
    <div v-else class="reg__card">
      <header class="reg__head">
        <h1 class="reg__title">¡Centro registrado!</h1>
        <p class="reg__lead">
          Guarda este código en un lugar seguro. Es la llave de acceso de tu centro y
          <strong>no se volverá a mostrar</strong>.
        </p>
      </header>

      <div class="codigo">
        <code class="codigo__value">{{ codigoRaiz }}</code>
        <AppButton variant="secondary" size="sm" @click="copiarCodigo">
          {{ copiado ? 'Copiado ✓' : 'Copiar' }}
        </AppButton>
      </div>

      <div class="necesidad">
        <h2 class="necesidad__title">¿Qué insumo necesitas con más urgencia?</h2>
        <p class="necesidad__hint">Opcional — puedes agregar más insumos desde tu panel.</p>
        <div class="necesidad__row">
          <select v-model="categoriaSel" class="field__select">
            <option value="">Sin definir por ahora</option>
            <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
              {{ cat.nombre }}
            </option>
          </select>
          <select v-model="urgenciaSel" class="field__select" :disabled="!categoriaSel">
            <option value="urgente">Urgente</option>
            <option value="media">Media</option>
            <option value="leve">Leve</option>
          </select>
        </div>
      </div>

      <div class="reg__actions">
        <AppButton size="lg" :loading="guardandoNecesidad" @click="finalizar">
          Ir a mi panel
        </AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reg {
  padding-block: var(--sp-10);
  display: flex;
  justify-content: center;
}
.reg__card {
  width: 100%;
  max-width: 720px;
  padding: var(--sp-8);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-md);
}
.reg__title {
  font-size: var(--fs-2xl);
}
.reg__lead {
  margin-top: var(--sp-2);
  color: var(--c-text-muted);
  font-size: var(--fs-sm);
}
.reg__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--sp-4);
  margin-top: var(--sp-6);
}
.reg__grid > :nth-child(1),
.reg__grid > :nth-child(2) {
  grid-column: 1 / -1;
}
.field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}
.field__label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
}
.field__select {
  padding: var(--sp-2) var(--sp-3);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-md);
  background: var(--c-surface);
}
.reg__error {
  margin-top: var(--sp-4);
  color: var(--c-danger);
  font-size: var(--fs-sm);
}
.reg__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-3);
  margin-top: var(--sp-6);
}

.codigo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  margin-top: var(--sp-6);
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
.necesidad {
  margin-top: var(--sp-6);
  padding-top: var(--sp-6);
  border-top: 1px solid var(--c-border);
}
.necesidad__title {
  font-size: var(--fs-lg);
}
.necesidad__hint {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
  margin-bottom: var(--sp-3);
}
.necesidad__row {
  display: flex;
  gap: var(--sp-3);
}
.necesidad__row .field__select {
  flex: 1;
}

@media (max-width: 560px) {
  .reg__grid {
    grid-template-columns: 1fr;
  }
}
</style>
