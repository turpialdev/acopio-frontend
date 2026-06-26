<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import { contactos } from '@/api'
import type { ContactoEmergencia } from '@/types/domain'

const abierto = ref(false)
const cargado = ref(false)
const cargando = ref(false)
const error = ref('')
const lista = ref<ContactoEmergencia[]>([])

async function abrir() {
  abierto.value = !abierto.value
  // La petición se hace solo la primera vez que se abre el panel.
  if (abierto.value && !cargado.value) {
    cargando.value = true
    error.value = ''
    try {
      lista.value = await contactos.listarContactosEmergencia()
      cargado.value = true
    } catch {
      error.value = 'No se pudieron cargar los contactos.'
    } finally {
      cargando.value = false
    }
  }
}
</script>

<template>
  <section class="emerg">
    <button class="emerg__toggle" :aria-expanded="abierto" @click="abrir">
      <span class="emerg__icon" aria-hidden="true">☎</span>
      <span class="emerg__label">Contactos de emergencia</span>
      <span class="emerg__chevron" :class="{ 'is-open': abierto }" aria-hidden="true">▾</span>
    </button>

    <div v-if="abierto" class="emerg__panel">
      <AppSpinner v-if="cargando" label="Cargando contactos…" />
      <p v-else-if="error" class="emerg__error">{{ error }}</p>
      <p v-else-if="!lista.length" class="emerg__empty">No hay contactos disponibles.</p>
      <ul v-else class="emerg__list">
        <li v-for="c in lista" :key="c.id" class="contact">
          <div class="contact__info">
            <p class="contact__name">{{ c.nombre }}</p>
            <p class="contact__type">{{ c.tipo }} · {{ c.zona }}</p>
          </div>
          <div class="contact__actions">
            <a v-if="c.telefonos[0]" :href="`tel:${c.telefonos[0]}`">
              <AppButton variant="secondary" size="sm">Llamar</AppButton>
            </a>
            <a v-if="c.whatsapp_url" :href="c.whatsapp_url" target="_blank" rel="noopener">
              <AppButton variant="ghost" size="sm">WhatsApp</AppButton>
            </a>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.emerg {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  overflow: hidden;
}
.emerg__toggle {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  width: 100%;
  padding: var(--sp-4) var(--sp-5);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  text-align: left;
}
.emerg__icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--r-md);
  background: var(--c-danger-soft);
  color: var(--c-danger);
}
.emerg__label {
  flex: 1;
}
.emerg__chevron {
  transition: transform 0.2s;
  color: var(--c-text-muted);
}
.emerg__chevron.is-open {
  transform: rotate(180deg);
}
.emerg__panel {
  padding: 0 var(--sp-5) var(--sp-4);
  border-top: 1px solid var(--c-border);
}
.emerg__error {
  padding: var(--sp-4) 0;
  color: var(--c-danger);
  font-size: var(--fs-sm);
}
.emerg__empty {
  padding: var(--sp-4) 0;
  color: var(--c-text-muted);
  font-size: var(--fs-sm);
}
.emerg__list {
  list-style: none;
  display: flex;
  flex-direction: column;
}
.contact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  padding: var(--sp-3) 0;
  border-bottom: 1px solid var(--c-border);
}
.contact:last-child {
  border-bottom: none;
}
.contact__name {
  font-weight: var(--fw-semibold);
}
.contact__type {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}
.contact__actions {
  display: flex;
  gap: var(--sp-2);
}
</style>
