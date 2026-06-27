<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TextField from '@/components/ui/TextField.vue'
import { codigos as codigosApi, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { sesion } = useAuth()

const paso = ref<'form' | 'exito'>('form')
const etiqueta = ref('')
const creando = ref(false)
const error = ref('')
const codigoCreado = ref('')
const compartido = ref(false)
const copiado = ref(false)

async function copiarCodigo() {
  try {
    await navigator.clipboard.writeText(codigoCreado.value)
    copiado.value = true
    setTimeout(() => (copiado.value = false), 2000)
  } catch { /* el usuario puede copiar manualmente */ }
}

async function crear() {
  if (!etiqueta.value.trim()) {
    error.value = 'El nombre del voluntario es requerido.'
    return
  }
  const id = sesion.centroId
  if (!id) return
  creando.value = true
  error.value = ''
  try {
    const c = await codigosApi.crearCodigo(id, etiqueta.value.trim())
    codigoCreado.value = c.codigo
    paso.value = 'exito'
  } catch (e) {
    error.value = e instanceof ApiError ? e.firstMessage : 'No se pudo crear el código.'
  } finally {
    creando.value = false
  }
}

async function compartir() {
  const texto = codigoCreado.value
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Código de Voluntario - Acopio Venezuela', text: texto })
    } else {
      await navigator.clipboard.writeText(texto)
      compartido.value = true
      setTimeout(() => (compartido.value = false), 2000)
    }
  } catch {
    /* usuario canceló */
  }
}
</script>

<template>
  <div class="page">
    <div class="content wrap">

      <!-- Volver -->
      <button class="back" type="button" @click="router.push({ name: 'panel-codigos' })">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Volver
      </button>

      <!-- Paso 1: formulario -->
      <div v-if="paso === 'form'" class="card">
        <h1 class="card__title">Crear Voluntario</h1>

        <TextField
          v-model="etiqueta"
          label="Nombre"
          required
          placeholder="Jacobo"
          :error="error"
        />

        <button class="btn-crear" type="button" :disabled="creando" @click="crear">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3.5 17h13a.5.5 0 0 0 .5-.5V6.707a.5.5 0 0 0-.146-.353l-2.708-2.708A.5.5 0 0 0 13.793 3.5H3.5a.5.5 0 0 0-.5.5v12.5a.5.5 0 0 0 .5.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M7 3.5V7h6V3.5M6 10.5h8v6H6v-6z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
          {{ creando ? 'Creando…' : 'Crear código' }}
        </button>
      </div>

      <!-- Paso 2: éxito -->
      <div v-else class="card card--exito">
        <!-- Ícono check verde -->
        <div class="check-circle">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M6 17l6 6L26 9" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M11 17l4 4" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <div class="exito__texto">
          <h1 class="exito__title">Registro exitoso</h1>
          <p class="exito__sub">
            Hemos registrado el voluntario de forma exitosa. Guarda este código para que el voluntario pueda ingresar
          </p>
        </div>

        <!-- Campo código readonly + copiar -->
        <div class="campo">
          <label class="campo__label">
            Código de Voluntario<span class="campo__req" aria-hidden="true">*</span>
          </label>
          <div class="campo__wrap">
            <input
              class="campo__input"
              :value="codigoCreado"
              readonly
              @click="($event.target as HTMLInputElement).select()"
            />
            <button type="button" class="campo__copy" @click="copiarCodigo">
              {{ copiado ? '✓' : 'Copiar' }}
            </button>
          </div>
        </div>

        <!-- Botón compartir -->
        <button class="btn-compartir" type="button" @click="compartir">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 2v11M10 2L7 5M10 2l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 10v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          {{ compartido ? 'Copiado ✓' : 'Compartir Código' }}
        </button>
      </div>

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
.back:hover { border-color: #2563eb; }

/* Card */
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
.card__title {
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  color: var(--c-text);
}

/* Botón crear */
.btn-crear {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  width: 100%;
  padding: var(--sp-4);
  background: #2563eb;
  border: none;
  border-radius: var(--r-xl);
  color: #fff;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: background 0.15s;
}
.btn-crear:hover:not(:disabled) { background: #1d4ed8; }
.btn-crear:disabled { opacity: 0.7; cursor: not-allowed; }

/* Éxito */
.card--exito { align-items: center; text-align: center; }

.check-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #dcfce7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.exito__texto { text-align: center; }
.exito__title {
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  color: var(--c-text);
}
.exito__sub {
  margin-top: var(--sp-2);
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
  line-height: 1.5;
}

/* Campo código */
.campo {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  text-align: left;
}
.campo__label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--c-text);
}
.campo__req { color: var(--c-danger); margin-left: 2px; }
.campo__wrap {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}
.campo__input {
  flex: 1;
  min-width: 0;
  padding: var(--sp-3) var(--sp-4);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-lg);
  background: var(--c-surface);
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  color: var(--c-text);
  cursor: text;
}
.campo__input:focus { outline: none; }
.campo__copy {
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
.campo__copy:hover { border-color: #2563eb; }

/* Botón compartir */
.btn-compartir {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  width: 100%;
  padding: var(--sp-4);
  background: #2563eb;
  border: none;
  border-radius: var(--r-xl);
  color: #fff;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: background 0.15s;
}
.btn-compartir:hover { background: #1d4ed8; }
</style>
