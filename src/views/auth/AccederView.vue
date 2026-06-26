<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import TextField from '@/components/ui/TextField.vue'
import PageHero from '@/components/layout/PageHero.vue'
import IconPersonAdd from '@/components/icons/IconPersonAdd.vue'
import { auth as authApi, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { iniciarSesionCodigo } = useAuth()

// El endpoint es el mismo; el rol lo decide el servidor. El `rol` de la query
// sólo personaliza los textos de la pantalla.
const esVoluntario = computed(() => route.query.rol === 'voluntario')
const copy = computed(() =>
  esVoluntario.value
    ? {
        title: 'Administración Voluntario',
        subtitle: 'Ingresa el código que recibiste al registrar tu centro de acopio.',
        cta: 'Entrar al Panel',
      }
    : {
        title: 'Administrar mi centro',
        subtitle: 'Ingresa el código que recibiste al registrar tu centro de acopio.',
        cta: 'Entrar al Panel',
      },
)

const codigo = ref('')
const error = ref('')
const enviando = ref(false)

async function enviar() {
  if (!codigo.value.trim()) {
    error.value = 'Ingresa tu código de acceso.'
    return
  }
  enviando.value = true
  error.value = ''
  try {
    const s = await authApi.loginConCodigo(codigo.value.trim())
    iniciarSesionCodigo({
      token: s.token,
      rol: s.rol,
      centroId: s.centro_id,
      etiqueta: s.etiqueta,
    })
    // Responsable → panel completo; voluntario → solo inventario.
    router.push({ name: s.rol === 'responsable' ? 'panel-centro' : 'inventario' })
  } catch (e) {
    error.value =
      e instanceof ApiError && e.status === 401
        ? 'Código inválido o revocado.'
        : e instanceof ApiError
          ? e.firstMessage
          : 'No se pudo iniciar sesión.'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div>
    <PageHero :title="copy.title" :subtitle="copy.subtitle">
      <template #icon><IconPersonAdd /></template>
    </PageHero>

    <div class="content page-pad">
      <form class="card" @submit.prevent="enviar">
        <TextField
          v-model="codigo"
          label="Código de verificación"
          placeholder="AX-1234-5678-0"
          autocomplete="off"
          :error="error"
        />
        <AppButton type="submit" block size="lg" :loading="enviando">{{ copy.cta }}</AppButton>
      </form>

      <p class="alt">
        ¿Aún no tienes un centro?
        <RouterLink :to="{ name: 'registrar' }">Regístralo aquí</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.page-pad {
  padding-block: var(--sp-6) var(--sp-10);
}
.card {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
  padding: var(--sp-5);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
}
.alt {
  margin-top: var(--sp-5);
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
  text-align: center;
}
</style>
