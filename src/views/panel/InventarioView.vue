<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import SelectField from '@/components/ui/SelectField.vue'
import TextField from '@/components/ui/TextField.vue'
import { catalogo, movimientos, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'
import type { TipoMovimiento } from '@/types/domain'

const router = useRouter()
const { sesion, cerrarSesion } = useAuth()

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
  limpiar()
}

function limpiar() {
  form.categoria_id = ''
  form.nota = ''
  form.cantidad = ''
  form.unidad = ''
  form.contraparte = ''
}

function salir() {
  cerrarSesion()
  router.push({ name: 'home' })
}

async function registrar() {
  errores.value = {}
  if (!form.categoria_id) errores.value.categoria_id = 'Selecciona un insumo.'
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
    /* sin catálogo no se puede registrar */
  }
})
</script>

<template>
  <div class="page">
    <div class="content wrap">

      <!-- Volver -->
      <button class="back" type="button" @click="router.push({ name: 'panel-centro' })">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Volver al panel
      </button>

      <!-- Tab switcher -->
      <div class="tabs" role="tablist">
        <button
          class="tab"
          :class="{ 'tab--active': tipo === 'entrada' }"
          role="tab"
          :aria-selected="tipo === 'entrada'"
          @click="setTipo('entrada')"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M1.66667 15.8333V12.5C1.66667 12.0398 2.03976 11.6667 2.5 11.6667C2.96024 11.6667 3.33333 12.0398 3.33333 12.5V15.8333C3.33333 16.0544 3.42119 16.2663 3.57748 16.4225C3.73376 16.5788 3.94565 16.6667 4.16667 16.6667H15.8333C16.0543 16.6667 16.2662 16.5788 16.4225 16.4225C16.5788 16.2663 16.6667 16.0544 16.6667 15.8333V12.5C16.6667 12.0398 17.0398 11.6667 17.5 11.6667C17.9602 11.6667 18.3333 12.0398 18.3333 12.5V15.8333C18.3333 16.4964 18.0698 17.1321 17.6009 17.6009C17.1321 18.0698 16.4964 18.3333 15.8333 18.3333H4.16667C3.50363 18.3333 2.86793 18.0698 2.39909 17.6009C1.93025 17.1321 1.66667 16.4964 1.66667 15.8333ZM9.16667 12.5V4.51173L6.42253 7.25587C6.09709 7.5813 5.56958 7.5813 5.24414 7.25587C4.9187 6.93043 4.9187 6.40292 5.24414 6.07748L9.41081 1.91082L9.47428 1.85385C9.8016 1.58689 10.2841 1.60572 10.5892 1.91082L14.7559 6.07748L14.8128 6.14096C15.0798 6.46827 15.061 6.95077 14.7559 7.25587C14.4508 7.56096 13.9683 7.57979 13.641 7.31283L13.5775 7.25587L10.8333 4.51173V12.5C10.8333 12.9602 10.4602 13.3333 10 13.3333C9.53976 13.3333 9.16667 12.9602 9.16667 12.5Z" fill="currentColor"/>
          </svg>
          Ingresar insumos
        </button>
        <button
          class="tab"
          :class="{ 'tab--active': tipo === 'salida' }"
          role="tab"
          :aria-selected="tipo === 'salida'"
          @click="setTipo('salida')"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M1.66667 15.8333V12.5C1.66667 12.0398 2.03977 11.6667 2.50001 11.6667C2.96024 11.6667 3.33334 12.0398 3.33334 12.5V15.8333C3.33334 16.0543 3.4212 16.2662 3.57748 16.4225C3.73376 16.5788 3.94566 16.6667 4.16667 16.6667H15.8333C16.0544 16.6667 16.2663 16.5788 16.4225 16.4225C16.5788 16.2662 16.6667 16.0543 16.6667 15.8333V12.5C16.6667 12.0398 17.0398 11.6667 17.5 11.6667C17.9602 11.6667 18.3333 12.0398 18.3333 12.5V15.8333C18.3333 16.4964 18.0698 17.1321 17.6009 17.6009C17.1321 18.0697 16.4964 18.3333 15.8333 18.3333H4.16667C3.50363 18.3333 2.86793 18.0697 2.39909 17.6009C1.93025 17.1321 1.66667 16.4964 1.66667 15.8333ZM9.16667 2.49999C9.16667 2.03975 9.53977 1.66666 10 1.66666C10.4602 1.66666 10.8333 2.03975 10.8333 2.49999V10.4883L13.5775 7.74413C13.9029 7.41869 14.4304 7.41869 14.7559 7.74413C15.0813 8.06957 15.0813 8.59708 14.7559 8.92252L10.5892 13.0892C10.2638 13.4146 9.73625 13.4146 9.41081 13.0892L5.24415 8.92252L5.18718 8.85904C4.92022 8.53173 4.93905 8.04923 5.24415 7.74413C5.54924 7.43903 6.03174 7.42021 6.35905 7.68716L6.42253 7.74413L9.16667 10.4883V2.49999Z" fill="currentColor"/>
          </svg>
          Entregar insumos
        </button>
      </div>

      <!-- Formulario -->
      <form class="card" @submit.prevent="registrar">
        <SelectField
          v-model="form.categoria_id"
          label="Insumo"
          required
          placeholder="Categoría del insumo"
          :options="opcionesCategoria"
          :error="errores.categoria_id"
        />

        <!-- Campos exclusivos de ENTRADA -->
        <template v-if="tipo === 'entrada'">
          <TextField
            v-model="form.nota"
            label="Descripción"
            placeholder="descripción breve del insumo"
          />
          <TextField
            v-model="form.cantidad"
            label="Cantidad"
            required
            type="number"
            placeholder="0"
            :error="errores.cantidad"
          />
          <TextField
            v-model="form.unidad"
            label="Unidad"
            placeholder="kg, cajas, bolsas…"
          />
          <TextField
            v-model="form.contraparte"
            label="Donante / Contraparte"
            placeholder="Nombre del donante o entidad"
          />
        </template>

        <!-- Campos exclusivos de SALIDA -->
        <template v-else>
          <TextField
            v-model="form.cantidad"
            label="Cantidad"
            required
            type="number"
            placeholder="1"
            :error="errores.cantidad"
          />
          <TextField
            v-model="form.contraparte"
            label="Quien Recibe"
            required
            placeholder="Nombre del beneficiado"
            :error="errores.contraparte"
          />
        </template>

        <p v-if="errores._" class="msg msg--err">{{ errores._ }}</p>
        <p v-if="exito" class="msg msg--ok">✓ Movimiento registrado.</p>

        <button type="submit" class="btn-registrar" :disabled="enviando">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 10l4.5 4.5L16 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ enviando ? 'Registrando…' : 'Registrar' }}
        </button>
      </form>

      <!-- Ver inventario -->
      <button class="btn-reporte" @click="router.push({ name: 'movimientos' })">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M6.6748 12.5C7.13504 12.5 7.50814 12.8731 7.50814 13.3333C7.50814 13.7936 7.13504 14.1667 6.6748 14.1667H6.66667C6.20643 14.1667 5.83333 13.7936 5.83333 13.3333C5.83333 12.8731 6.20643 12.5 6.66667 12.5H6.6748ZM13.3333 12.5C13.7936 12.5 14.1667 12.8731 14.1667 13.3333C14.1667 13.7936 13.7936 14.1667 13.3333 14.1667H10C9.53976 14.1667 9.16667 13.7936 9.16667 13.3333C9.16667 12.8731 9.53976 12.5 10 12.5H13.3333ZM6.6748 8.33333C7.13504 8.33333 7.50814 8.70643 7.50814 9.16667C7.50814 9.62691 7.13504 10 6.6748 10H6.66667C6.20643 10 5.83333 9.62691 5.83333 9.16667C5.83333 8.70643 6.20643 8.33333 6.66667 8.33333H6.6748ZM13.3333 8.33333C13.7936 8.33333 14.1667 8.70643 14.1667 9.16667C14.1667 9.62691 13.7936 10 13.3333 10H10C9.53976 10 9.16667 9.62691 9.16667 9.16667C9.16667 8.70643 9.53976 8.33333 10 8.33333H13.3333ZM12.5 2.5H7.5V4.16667H12.5V2.5ZM14.1667 4.16667C14.1667 5.08714 13.4205 5.83333 12.5 5.83333H7.5C6.57953 5.83333 5.83333 5.08714 5.83333 4.16667H5C4.77899 4.16667 4.56709 4.25453 4.41081 4.41081C4.25453 4.56709 4.16667 4.77899 4.16667 5V16.6667L4.17074 16.7489C4.18964 16.9397 4.27402 17.1191 4.41081 17.2559C4.56709 17.4121 4.77899 17.5 5 17.5H15C15.221 17.5 15.4329 17.4121 15.5892 17.2559C15.7455 17.0996 15.8333 16.8877 15.8333 16.6667V5C15.8333 4.77899 15.7455 4.56709 15.5892 4.41081C15.4524 4.27402 15.273 4.18964 15.0822 4.17074L15 4.16667H14.1667ZM15 2.5C15.663 2.5 16.2987 2.76358 16.7676 3.23242C17.2364 3.70126 17.5 4.33696 17.5 5V16.6667C17.5 17.3297 17.2364 17.9654 16.7676 18.4342C16.2987 18.9031 15.663 19.1667 15 19.1667H5C4.33696 19.1667 3.70126 18.9031 3.23242 18.4342C2.76358 17.9654 2.5 17.3297 2.5 16.6667V5C2.5 4.33696 2.76358 3.70126 3.23242 3.23242C3.70126 2.76358 4.33696 2.5 5 2.5H5.83333C5.83333 1.57953 6.57953 0.833334 7.5 0.833334H12.5C13.4205 0.833334 14.1667 1.57953 14.1667 2.5H15Z" fill="#2563EB"/>
        </svg>
        Ver inventario de insumos
      </button>

      <!-- Cerrar sesión -->
      <button class="btn-salir" @click="salir">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M1.66663 15.8333V4.16667C1.66663 3.50363 1.93021 2.86793 2.39905 2.39909C2.86789 1.93025 3.50358 1.66667 4.16663 1.66667H7.49996C7.9602 1.66667 8.33329 2.03976 8.33329 2.5C8.33329 2.96024 7.9602 3.33333 7.49996 3.33333H4.16663C3.94561 3.33333 3.73371 3.42119 3.57743 3.57748C3.42115 3.73376 3.33329 3.94565 3.33329 4.16667V15.8333C3.33329 16.0543 3.42115 16.2662 3.57743 16.4225C3.73371 16.5788 3.94561 16.6667 4.16663 16.6667H7.49996C7.9602 16.6667 8.33329 17.0398 8.33329 17.5C8.33329 17.9602 7.9602 18.3333 7.49996 18.3333H4.16663C3.50358 18.3333 2.86789 18.0698 2.39905 17.6009C1.93021 17.1321 1.66663 16.4964 1.66663 15.8333ZM12.7441 5.24414C13.0492 4.93905 13.5317 4.92022 13.859 5.18718L13.9225 5.24414L18.0892 9.41081C18.4146 9.73625 18.4146 10.2638 18.0892 10.5892L13.9225 14.7559C13.597 15.0813 13.0695 15.0813 12.7441 14.7559C12.4187 14.4304 12.4187 13.9029 12.7441 13.5775L15.4882 10.8333H7.49996C7.03972 10.8333 6.66663 10.4602 6.66663 10C6.66663 9.53976 7.03972 9.16667 7.49996 9.16667H15.4882L12.7441 6.42253L12.6871 6.35905C12.4202 6.03174 12.439 5.54924 12.7441 5.24414Z" fill="#2563EB"/>
        </svg>
        Cerrar sesión
      </button>

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
  gap: var(--sp-4);
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
.back:hover { border-color: #2563eb; }

/* Tab switcher */
.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-2);
  padding: var(--sp-2);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-sm);
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-3) var(--sp-2);
  border: none;
  border-radius: var(--r-lg);
  background: transparent;
  color: var(--c-text-faint);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  line-height: 1.3;
}

.tab--active {
  background: #2563eb;
  color: #ffffff;
}

/* Form card */
.card {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  padding: var(--sp-5);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-md);
}

/* Mensajes */
.msg { font-size: var(--fs-sm); }
.msg--err { color: var(--c-danger); }
.msg--ok { color: var(--c-success); font-weight: var(--fw-semibold); }

/* Botón registrar */
.btn-registrar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  width: 100%;
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
.btn-registrar:hover:not(:disabled) { background: #1d4ed8; }
.btn-registrar:disabled { opacity: 0.7; cursor: not-allowed; }

/* Botón ver inventario */
.btn-reporte {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  width: 100%;
  padding: var(--sp-4);
  background: #e6f2fe;
  border: none;
  border-radius: var(--r-xl);
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  color: #2563eb;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-reporte:hover { background: #d0e8fd; }

/* Botón cerrar sesión */
.btn-salir {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  width: 100%;
  padding: var(--sp-4);
  background: var(--c-surface);
  border: 1.5px solid #2563eb;
  border-radius: var(--r-xl);
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  color: #2563eb;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-salir:hover { background: #e6f2fe; }
</style>
