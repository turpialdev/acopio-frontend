<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import TextField from '@/components/ui/TextField.vue'
import PageHero from '@/components/layout/PageHero.vue'
import IconPersonAdd from '@/components/icons/IconPersonAdd.vue'
import { codigos as codigosApi, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'
import type { CodigoVoluntario } from '@/types/domain'

const router = useRouter()
const { sesion } = useAuth()

const lista = ref<CodigoVoluntario[]>([])
const cargando = ref(true)
const error = ref('')

const etiqueta = ref('')
const creando = ref(false)
const errorCrear = ref('')
// Código en texto plano recién creado (se muestra una sola vez).
const nuevoCodigo = ref<{ etiqueta: string; codigo: string } | null>(null)
const copiado = ref(false)

const revocando = ref<string | null>(null)

async function crear() {
  const id = sesion.centroId
  if (!id || !etiqueta.value.trim()) {
    errorCrear.value = 'Indica una etiqueta (ej: "Juan - Puerta").'
    return
  }
  creando.value = true
  errorCrear.value = ''
  try {
    const c = await codigosApi.crearCodigo(id, etiqueta.value.trim())
    nuevoCodigo.value = { etiqueta: c.etiqueta, codigo: c.codigo }
    lista.value.unshift({ id: c.id, etiqueta: c.etiqueta, rol: 'voluntario', revocado_en: null })
    etiqueta.value = ''
  } catch (e) {
    errorCrear.value = e instanceof ApiError ? e.firstMessage : 'No se pudo crear el código.'
  } finally {
    creando.value = false
  }
}

async function copiar() {
  if (!nuevoCodigo.value) return
  try {
    await navigator.clipboard.writeText(nuevoCodigo.value.codigo)
    copiado.value = true
    setTimeout(() => (copiado.value = false), 2000)
  } catch {
    /* copiar manualmente */
  }
}

async function revocar(c: CodigoVoluntario) {
  const id = sesion.centroId
  if (!id) return
  revocando.value = c.id
  try {
    await codigosApi.revocarCodigo(id, c.id)
    c.revocado_en = new Date().toISOString()
  } catch {
    /* ignora; el ítem queda como estaba */
  } finally {
    revocando.value = null
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
    lista.value = await codigosApi.listarCodigos(id)
  } catch (e) {
    error.value = e instanceof ApiError ? e.firstMessage : 'No se pudieron cargar los códigos.'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div>
    <PageHero
      title="Códigos de voluntario"
      subtitle="Crea un código por voluntario. Cada uno accede sólo al inventario."
    >
      <template #icon><IconPersonAdd /></template>
    </PageHero>

    <div class="content page-pad">
      <!-- Crear -->
      <form class="card" @submit.prevent="crear">
        <TextField
          v-model="etiqueta"
          label="Etiqueta del voluntario"
          placeholder="Ej: María - Almacén"
          :error="errorCrear"
        />
        <AppButton type="submit" block :loading="creando">Crear código</AppButton>
      </form>

      <!-- Código recién creado (una sola vez) -->
      <div v-if="nuevoCodigo" class="nuevo">
        <p class="nuevo__lead">
          Código para <strong>{{ nuevoCodigo.etiqueta }}</strong> — entrégalo al voluntario.
          <strong>No se volverá a mostrar.</strong>
        </p>
        <div class="codigo">
          <code class="codigo__value">{{ nuevoCodigo.codigo }}</code>
          <AppButton variant="outline" size="sm" @click="copiar">
            {{ copiado ? 'Copiado ✓' : 'Copiar' }}
          </AppButton>
        </div>
      </div>

      <!-- Listado -->
      <AppSpinner v-if="cargando" label="Cargando códigos…" />
      <p v-else-if="error" class="error">{{ error }}</p>
      <p v-else-if="!lista.length" class="empty">Aún no hay códigos de voluntario.</p>
      <ul v-else class="lista">
        <li v-for="c in lista" :key="c.id" class="item" :class="{ 'is-rev': c.revocado_en }">
          <div>
            <p class="item__label">{{ c.etiqueta || 'Sin etiqueta' }}</p>
            <p class="item__estado">{{ c.revocado_en ? 'Revocado' : 'Activo' }}</p>
          </div>
          <AppButton
            v-if="!c.revocado_en"
            variant="ghost"
            size="sm"
            :loading="revocando === c.id"
            @click="revocar(c)"
          >
            Revocar
          </AppButton>
        </li>
      </ul>
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
.nuevo {
  padding: var(--sp-4);
  background: var(--c-primary-50);
  border: 1px dashed var(--c-primary-300);
  border-radius: var(--r-md);
}
.nuevo__lead {
  font-size: var(--fs-sm);
}
.codigo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  margin-top: var(--sp-3);
}
.codigo__value {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  color: var(--c-primary-700);
  letter-spacing: 0.05em;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.error {
  color: var(--c-danger);
  font-size: var(--fs-sm);
}
.empty {
  color: var(--c-text-muted);
  font-size: var(--fs-sm);
}
.lista {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
}
.item.is-rev {
  opacity: 0.6;
}
.item__label {
  font-weight: var(--fw-semibold);
}
.item__estado {
  font-size: var(--fs-xs);
  color: var(--c-text-muted);
}
</style>
