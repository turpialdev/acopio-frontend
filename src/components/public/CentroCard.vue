<script setup lang="ts">
import { computed } from 'vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { URGENCIA_META, VERIFICACION_META, tiempoRelativo } from '@/lib/format'
import type { Centro } from '@/types/domain'

const props = defineProps<{ centro: Centro }>()

const verif = computed(() => VERIFICACION_META[props.centro.estado_verificacion])

/** Color del borde izquierdo según la urgencia máxima. */
const borderVar = computed(() =>
  props.centro.urgencia_maxima
    ? `var(${URGENCIA_META[props.centro.urgencia_maxima].varName})`
    : 'var(--c-border)',
)

function llamar() {
  if (props.centro.contacto) window.location.href = `tel:${props.centro.contacto}`
}
</script>

<template>
  <article class="card" :style="{ '--accent': borderVar }">
    <header class="card__head">
      <div>
        <h3 class="card__title">{{ centro.nombre }}</h3>
        <p class="card__loc">{{ centro.municipio }}, {{ centro.estado }}</p>
      </div>
      <AppBadge :tone="verif.tone" dot>{{ verif.label }}</AppBadge>
    </header>

    <p class="card__address">{{ centro.direccion }}</p>

    <section v-if="centro.necesidades.length" class="card__needs">
      <p class="card__label">Insumos requeridos</p>
      <ul class="needs">
        <li v-for="n in centro.necesidades" :key="n.id" class="need">
          <span
            class="need__dot"
            :style="{ background: `var(${URGENCIA_META[n.urgencia].varName})` }"
          />
          {{ n.categoria_nombre }}<template v-if="n.detalle"> · {{ n.detalle }}</template>
        </li>
      </ul>
    </section>

    <footer class="card__foot">
      <span class="card__updated">
        Última actualización: {{ tiempoRelativo(centro.actualizado_en) }}
      </span>
      <div class="card__cta">
        <AppButton
          v-if="centro.contacto"
          variant="secondary"
          size="sm"
          @click="llamar"
        >
          Llamar
        </AppButton>
        <a
          v-if="centro.ubicacion_url"
          :href="centro.ubicacion_url"
          target="_blank"
          rel="noopener"
          class="card__map"
        >
          Cómo llegar →
        </a>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-5);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-left: 4px solid var(--accent);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.15s;
}
.card:hover {
  box-shadow: var(--shadow-md);
}
.card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--sp-3);
}
.card__title {
  font-size: var(--fs-lg);
}
.card__loc {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}
.card__address {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}
.card__label {
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--c-text-faint);
  margin-bottom: var(--sp-2);
}
.needs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  list-style: none;
}
.need {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-1) var(--sp-3);
  background: var(--c-surface-2);
  border-radius: var(--r-full);
  font-size: var(--fs-sm);
}
.need__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  flex-wrap: wrap;
  margin-top: auto;
  padding-top: var(--sp-3);
  border-top: 1px solid var(--c-border);
}
.card__updated {
  font-size: var(--fs-xs);
  color: var(--c-text-faint);
}
.card__cta {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.card__map {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
}
</style>
