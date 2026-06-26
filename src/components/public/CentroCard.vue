<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import { URGENCIA_META, VERIFICACION_META, fechaHora } from '@/lib/format'
import type { Centro } from '@/types/domain'

const props = defineProps<{ centro: Centro }>()

const verif = computed(() => VERIFICACION_META[props.centro.estado_verificacion])

function llamar() {
  if (props.centro.contacto) window.location.href = `tel:${props.centro.contacto}`
}

function comoLlegar() {
  if (props.centro.ubicacion_url)
    window.open(props.centro.ubicacion_url, '_blank', 'noopener')
}

async function compartir() {
  const c = props.centro
  const texto = `${c.nombre} — ${c.direccion}, ${c.municipio}, ${c.estado}`
  const url = c.ubicacion_url ?? location.href
  if (navigator.share) {
    try {
      await navigator.share({ title: c.nombre, text: texto, url })
    } catch {
      /* el usuario canceló */
    }
  } else {
    try {
      await navigator.clipboard.writeText(`${texto} ${url}`)
    } catch {
      /* sin clipboard */
    }
  }
}
</script>

<template>
  <article class="card">
    <header class="card__head">
      <h3 class="card__title">{{ centro.nombre }}</h3>
      <span class="verif" :class="`verif--${verif.tone}`">{{ verif.label }}</span>
    </header>

    <!-- Dirección -->
    <div class="row">
      <div class="row__text">
        <span class="row__label">Dirección:</span>
        <p class="row__value">{{ centro.direccion }}</p>
      </div>
      <AppButton v-if="centro.ubicacion_url" size="sm" @click="comoLlegar">Como llegar</AppButton>
    </div>

    <!-- Contacto -->
    <div v-if="centro.contacto" class="row">
      <div class="row__text">
        <span class="row__label">Contacto:</span>
        <p class="row__value">{{ centro.contacto }}</p>
      </div>
      <AppButton size="sm" @click="llamar">Llamar</AppButton>
    </div>

    <!-- Insumos requeridos -->
    <section v-if="centro.necesidades.length" class="needs">
      <p class="needs__head">⚠ Insumos requeridos</p>
      <p class="needs__updated">ÚLTIMA ACTUALIZACIÓN: {{ fechaHora(centro.actualizado_en) }}</p>
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

    <AppButton block @click="compartir">Compartir</AppButton>
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
.card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
}
.card__title {
  font-size: var(--fs-xl);
}

.verif {
  flex-shrink: 0;
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--r-full);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: #fff;
}
.verif--success {
  background: var(--c-success);
}
.verif--neutral {
  background: var(--c-leve);
}
.verif--danger {
  background: var(--c-danger);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
}
.row__label {
  font-weight: var(--fw-bold);
  font-size: var(--fs-sm);
}
.row__value {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}

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
  font-weight: var(--fw-bold);
  color: var(--c-danger);
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
  padding: var(--sp-2) var(--sp-3);
  background: var(--chip-soft, var(--c-surface));
  border: 1px solid var(--chip, var(--c-danger));
  border-radius: var(--r-sm);
  min-width: 0;
}
.chip__cat {
  font-weight: var(--fw-bold);
  font-size: var(--fs-sm);
  color: var(--chip, var(--c-danger));
}
.chip__detail {
  font-size: var(--fs-xs);
  color: var(--chip, var(--c-danger));
}
</style>
