<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import TextField from '@/components/ui/TextField.vue'
import { auth as authApi, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { iniciarSesionCodigo } = useAuth()

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
  <div class="auth">
    <div class="auth__card">
      <h1 class="auth__title">Acceso con código</h1>
      <p class="auth__lead">
        Ingresa el código de gestión que recibiste. Te llevará al inventario de tu centro.
      </p>

      <form class="auth__form" @submit.prevent="enviar">
        <TextField
          v-model="codigo"
          label="Código de acceso"
          placeholder="AX-1234-5678-0"
          autocomplete="off"
          :error="error"
        />
        <AppButton type="submit" block size="lg" :loading="enviando">Ingresar</AppButton>
      </form>

      <p class="auth__alt">
        ¿Aún no tienes un centro?
        <RouterLink :to="{ name: 'registrar' }">Regístralo aquí</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth {
  display: flex;
  justify-content: center;
  padding: var(--sp-12) var(--sp-5);
}
.auth__card {
  width: 100%;
  max-width: 420px;
  padding: var(--sp-8);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-md);
}
.auth__title {
  font-size: var(--fs-2xl);
}
.auth__lead {
  margin-top: var(--sp-2);
  color: var(--c-text-muted);
  font-size: var(--fs-sm);
}
.auth__form {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
  margin-top: var(--sp-6);
}
.auth__alt {
  margin-top: var(--sp-5);
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
  text-align: center;
}
</style>
