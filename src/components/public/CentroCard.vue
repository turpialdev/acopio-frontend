<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import IconComoLlegar from '@/components/icons/IconComoLlegar.vue'
import IconShare from '@/components/icons/IconShare.vue'
import { URGENCIA_META, VERIFICACION_META, fechaHora } from '@/lib/format'
import type { Centro } from '@/types/domain'

const props = defineProps<{ centro: Centro }>()

const verif = computed(() => VERIFICACION_META[props.centro.estado_verificacion])
const copiado = ref(false)

function comoLlegar() {
  if (props.centro.ubicacion_url)
    window.open(props.centro.ubicacion_url, '_blank', 'noopener')
}

async function copiarReporte() {
  const c = props.centro
  const lineas: string[] = [
    `📍 ${c.nombre}`,
    `${c.municipio}, ${c.estado}`,
    `Dirección: ${c.direccion}`,
  ]
  if (c.contacto) lineas.push(`Contacto: ${c.contacto}`)
  if (c.necesidades.length) {
    lineas.push('')
    lineas.push('Necesidades:')
    for (const n of c.necesidades) {
      const urg = n.urgencia === 'urgente' ? '🔴' : n.urgencia === 'media' ? '🟡' : '🟢'
      const detalle = n.detalle ? ` (${n.detalle})` : ''
      lineas.push(`${urg} ${n.categoria_nombre}${detalle}`)
    }
  }
  lineas.push('')
  lineas.push(`Actualizado: ${fechaHora(c.actualizado_en)}`)
  try {
    await navigator.clipboard.writeText(lineas.join('\n'))
    copiado.value = true
    setTimeout(() => (copiado.value = false), 2000)
  } catch {
    /* sin clipboard */
  }
}
</script>

<template>
  <article class="card">
    <!-- Cabecera: nombre + badge de verificación -->
    <header class="card__head">
      <h3 class="card__title">{{ centro.nombre }}</h3>
      <span class="verif" :class="`verif--${verif.tone}`">{{ verif.label }}</span>
    </header>

    <!-- Información del centro -->
    <div class="info">
      <div v-if="centro.contacto" class="info__field">
        <span class="info__label">Número de contacto</span>
        <a :href="`tel:${centro.contacto}`" class="info__value info__tel">{{ centro.contacto }}</a>
      </div>
      <div class="info__field">
        <span class="info__label">Dirección</span>
        <p class="info__value">{{ centro.direccion }}, {{ centro.municipio }}, {{ centro.estado }}</p>
      </div>
    </div>

    <!-- Cómo llegar -->
    <AppButton v-if="centro.ubicacion_url" variant="outline" block class="llegar-btn" @click="comoLlegar">
      <IconComoLlegar />
      Cómo llegar
    </AppButton>

    <!-- Insumos requeridos -->
    <section v-if="centro.necesidades.length" class="needs">
      <p class="needs__head">⚠ Insumos requeridos</p>
      <p class="needs__updated">Actualizado: {{ fechaHora(centro.actualizado_en) }}</p>
      <ul class="needs__list">
        <li
          v-for="n in centro.necesidades"
          :key="n.id"
          class="chip"
          :style="{
            '--chip': `var(${URGENCIA_META[n.urgencia].varName})`,
            '--chip-soft': `var(${URGENCIA_META[n.urgencia].varName}-soft)`,
          }"
        >
          <span class="chip__cat">{{ n.categoria_nombre }}</span>
          <span v-if="n.detalle" class="chip__detail">{{ n.detalle }}</span>
        </li>
      </ul>
    </section>

    <!-- Copiar reporte -->
    <AppButton block variant="primary" @click="copiarReporte">
      <IconShare />
      {{ copiado ? '¡Copiado!' : 'Copiar reporte para WhatsApp/SMS' }}
    </AppButton>
  </article>
</template>

<style scoped>
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

/* Cabecera */
.card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--sp-3);
}
.card__title {
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  min-width: 0;
  word-break: break-word;
  overflow-wrap: break-word;
}
.verif {
  flex-shrink: 0;
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--r-full);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: #fff;
}
.verif--success { background: var(--c-success); }
.verif--neutral { background: var(--c-leve); }
.verif--danger  { background: var(--c-danger); }

/* Info */
.info {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}
.info__field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.info__label {
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: var(--c-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.info__value {
  font-size: var(--fs-sm);
  color: var(--c-text);
  word-break: break-word;
  overflow-wrap: break-word;
}
.info__tel {
  color: var(--c-primary-600);
  text-decoration: none;
  font-weight: var(--fw-medium);
}
.info__tel:hover {
  text-decoration: underline;
}

/* Botón Cómo llegar */
:deep(.llegar-btn) {
  background: #e6f2fe;
  border-color: transparent;
  color: #2563eb;
  border-radius: 12px;
}
:deep(.llegar-btn:hover:not(:disabled)) {
  background: #e6f2fe;
  border-color: #2563eb;
}

/* Insumos requeridos */
.needs {
  padding: var(--sp-4);
  background: var(--c-danger-soft);
  border: 1px solid var(--c-danger);
  border-radius: var(--r-md);
}
.needs__head {
  font-weight: var(--fw-bold);
  font-size: var(--fs-sm);
  color: var(--c-danger);
}
.needs__updated {
  margin-top: var(--sp-1);
  font-size: var(--fs-xs);
  color: var(--c-danger);
  opacity: 0.8;
}
.needs__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-top: var(--sp-3);
  list-style: none;
}
.chip {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: var(--sp-1) var(--sp-3);
  background: var(--chip-soft, var(--c-surface));
  border: 1px solid var(--chip, var(--c-danger));
  border-radius: var(--r-full);
  min-width: 0;
}
.chip__cat {
  font-weight: var(--fw-semibold);
  font-size: var(--fs-sm);
  color: var(--chip, var(--c-danger));
}
.chip__detail {
  font-size: var(--fs-xs);
  color: var(--chip, var(--c-danger));
}
</style>
