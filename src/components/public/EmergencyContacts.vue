<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import IconPersonCircle from '@/components/icons/IconPersonCircle.vue'
import { contactos } from '@/api'
import type { ContactoEmergencia } from '@/types/domain'

const abierto = ref(false)
const cargado = ref(false)
const cargando = ref(false)
const error = ref('')
const lista = ref<ContactoEmergencia[]>([])

async function alternar() {
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
    <header class="emerg__head">
      <div>
        <p class="emerg__eyebrow">Información útil</p>
        <h2 class="emerg__title">Contactos de Emergencia</h2>
      </div>
      <AppButton variant="ghost" size="sm" class="toggle-btn" @click="alternar">
        {{ abierto ? 'Ocultar' : 'Ver' }}
      </AppButton>
    </header>

    <div v-if="abierto" class="emerg__body">
      <AppSpinner v-if="cargando" label="Cargando contactos…" />
      <p v-else-if="error" class="emerg__error">{{ error }}</p>
      <p v-else-if="!lista.length" class="emerg__empty">No hay contactos disponibles.</p>
      <ul v-else class="emerg__list">
        <li v-for="c in lista" :key="c.id" class="contact">
          <span class="contact__icon" aria-hidden="true"><IconPersonCircle /></span>
          <div class="contact__info">
            <p class="contact__name">{{ c.nombre }}</p>
            <p class="contact__type">{{ c.tipo }}</p>
          </div>
          <div class="contact__actions">
            <a v-if="c.telefonos[0]" :href="`tel:${c.telefonos[0]}`">
              <AppButton variant="outline" size="sm" class="llamar-btn">Llamar</AppButton>
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
:deep(.toggle-btn) {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
}
:deep(.toggle-btn):hover {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
  border-color: #2563eb;
}
:deep(.llamar-btn) {
  color: #2563eb;
  border-color: #2563eb;
}
:deep(.llamar-btn):hover {
  background: rgba(37, 99, 235, 0.06);
}
.emerg {
  padding: var(--sp-4) var(--sp-5);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
}
.emerg__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
}
.emerg__eyebrow {
  font-size: var(--fs-xs);
  color: var(--c-text-faint);
}
.emerg__title {
  font-size: var(--fs-lg);
}
.emerg__body {
  margin-top: var(--sp-4);
}
.emerg__error {
  color: var(--c-danger);
  font-size: var(--fs-sm);
}
.emerg__empty {
  color: var(--c-text-muted);
  font-size: var(--fs-sm);
}
.emerg__list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  list-style: none;
}
.contact {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
}
.contact__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--c-primary-50);
  color: var(--c-primary-600);
  font-size: 1.1rem;
}
.contact__info {
  flex: 1;
  min-width: 0;
}
.contact__name {
  font-weight: var(--fw-bold);
}
.contact__type {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}
.contact__actions {
  display: flex;
  gap: var(--sp-2);
  flex-shrink: 0;
}
</style>
