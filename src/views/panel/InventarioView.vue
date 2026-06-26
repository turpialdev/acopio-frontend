<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import SelectField from '@/components/ui/SelectField.vue'
import TextField from '@/components/ui/TextField.vue'
import PageHero from '@/components/layout/PageHero.vue'
import IconPersonAdd from '@/components/icons/IconPersonAdd.vue'
import { catalogo, movimientos, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'
import type { TipoMovimiento } from '@/types/domain'

const router = useRouter()
const { sesion } = useAuth()

const tipo = ref<TipoMovimiento>('entrada')
const opcionesCategoria = ref<{ value: string; label: string }[]>([])

const form = reactive({
  categoria_id: '',
  nota: '',
  cantidad: '',
  unidad: '',
  contraparte: '',
})

const errores = ref<Record<string, string>>({})
const enviando = ref(false)
const exito = ref(false)

function setTipo(t: TipoMovimiento) {
  tipo.value = t
  errores.value = {}
}

function limpiar() {
  form.categoria_id = ''
  form.nota = ''
  form.cantidad = ''
  form.unidad = ''
  form.contraparte = ''
}

async function registrar() {
  errores.value = {}
  if (!form.categoria_id) errores.value.categoria_id = 'Selecciona un insumo.'
  // En salida, cantidad y beneficiado son obligatorios (regla de UI).
  if (tipo.value === 'salida') {
    if (!form.cantidad || Number(form.cantidad) <= 0)
      errores.value.cantidad = 'Indica la cantidad.'
    if (!form.contraparte.trim()) errores.value.contraparte = 'Indica quién recibe.'
  }
  if (Object.keys(errores.value).length) return

  if (!sesion.centroId) {
    errores.value._ = 'Sesión sin centro asociado.'
    return
  }

  enviando.value = true
  exito.value = false
  try {
    await movimientos.crearMovimiento(sesion.centroId, {
      categoria_id: form.categoria_id,
      tipo: tipo.value,
      cantidad: form.cantidad ? Number(form.cantidad) : null,
      unidad: form.unidad.trim() || null,
      nota: form.nota.trim() || null,
      contraparte: form.contraparte.trim() || null,
    })
    exito.value = true
    limpiar()
    setTimeout(() => (exito.value = false), 3000)
  } catch (e) {
    if (e instanceof ApiError && e.fields) {
      errores.value = Object.fromEntries(
        Object.entries(e.fields).map(([k, v]) => [k, v[0] ?? '']),
      )
    } else {
      errores.value._ = e instanceof ApiError ? e.firstMessage : 'No se pudo registrar.'
    }
  } finally {
    enviando.value = false
  }
}

onMounted(async () => {
  try {
    const cats = await catalogo.listarCategorias({ es_insumo: true, activa: true })
    opcionesCategoria.value = cats.map((c) => ({ value: c.id, label: c.nombre }))
  } catch {
    /* sin catálogo no se puede registrar; el select queda vacío */
  }
})
</script>

<template>
  <div>
    <PageHero title="Inventario de movimientos" subtitle="Registro por turno · sin totales">
      <template #icon><IconPersonAdd /></template>
    </PageHero>

    <div class="content page-pad">
      <!-- Switch entrada / salida -->
      <div class="switch" role="tablist">
        <button
          class="switch__opt"
          :class="{ 'is-active': tipo === 'entrada' }"
          role="tab"
          :aria-selected="tipo === 'entrada'"
          @click="setTipo('entrada')"
        >
          Ingreso de insumos
        </button>
        <button
          class="switch__opt"
          :class="{ 'is-active': tipo === 'salida' }"
          role="tab"
          :aria-selected="tipo === 'salida'"
          @click="setTipo('salida')"
        >
          Salida de insumos
        </button>
      </div>

      <form class="card" @submit.prevent="registrar">
        <SelectField
          v-model="form.categoria_id"
          label="Insumo"
          required
          placeholder="Categoría del insumo"
          :options="opcionesCategoria"
          :error="errores.categoria_id"
        />

        <TextField
          v-model="form.nota"
          label="Descripción (opcional)"
          placeholder="descripción breve del insumo"
        />

        <!-- Entrada: cantidad + unidad opcionales, lado a lado -->
        <div v-if="tipo === 'entrada'" class="grid2">
          <TextField v-model="form.cantidad" label="Cantidad (opcional)" type="number" placeholder="0" />
          <TextField v-model="form.unidad" label="Unidad (opcional)" placeholder="kg, cajas, bolsas…" />
        </div>

        <!-- Salida: cantidad obligatoria + unidad opcional -->
        <div v-else class="grid2">
          <TextField
            v-model="form.cantidad"
            label="Cantidad"
            type="number"
            required
            placeholder="1"
            :error="errores.cantidad"
          />
          <TextField v-model="form.unidad" label="Unidad (opcional)" placeholder="cajas, bolsas…" />
        </div>

        <!-- Contraparte: donante (entrada) o beneficiado (salida) -->
        <TextField
          v-if="tipo === 'entrada'"
          v-model="form.contraparte"
          label="Donante / Contraparte (opcional)"
          placeholder="Nombre del donante o entidad"
        />
        <TextField
          v-else
          v-model="form.contraparte"
          label="Quien recibe"
          required
          placeholder="Nombre del beneficiado"
          :error="errores.contraparte"
        />

        <p v-if="errores._" class="card__error">{{ errores._ }}</p>
        <p v-if="exito" class="card__ok">✓ Movimiento registrado.</p>

        <AppButton type="submit" block size="lg" :loading="enviando">Registrar</AppButton>
        <AppButton
          variant="outline"
          block
          size="lg"
          @click="router.push({ name: 'movimientos' })"
        >
          Ver movimientos
        </AppButton>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-pad {
  padding-block: var(--sp-5) var(--sp-10);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-2);
  padding: var(--sp-1);
  background: var(--c-surface-2);
  border-radius: var(--r-md);
}
.switch__opt {
  padding: var(--sp-3);
  border: none;
  border-radius: var(--r-sm);
  background: transparent;
  font-weight: var(--fw-semibold);
  color: var(--c-text-muted);
  cursor: pointer;
  transition:
    background-color 0.15s,
    color 0.15s;
}
.switch__opt.is-active {
  background: var(--c-primary-500);
  color: var(--c-text-invert);
}

.card {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  padding: var(--sp-5);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
}
.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);
}
@media (max-width: 480px) {
  .grid2 {
    grid-template-columns: 1fr;
  }
}
.card__error {
  font-size: var(--fs-sm);
  color: var(--c-danger);
}
.card__ok {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--c-success);
}
</style>
