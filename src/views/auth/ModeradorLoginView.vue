<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import TextField from '@/components/ui/TextField.vue'
import { auth as authApi, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { iniciarSesionModerador } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const enviando = ref(false)

async function enviar() {
  enviando.value = true
  error.value = ''
  try {
    const s = await authApi.loginModerador(email.value.trim(), password.value)
    iniciarSesionModerador({ token: s.token, nombre: s.nombre })
    router.push({ name: 'moderacion' })
  } catch (e) {
    error.value =
      e instanceof ApiError && e.status === 401
        ? 'Credenciales inválidas.'
        : 'No se pudo iniciar sesión.'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="auth">
    <div class="auth__card">
      <h1 class="auth__title">Panel de moderación</h1>
      <p class="auth__lead">Acceso exclusivo para el equipo de moderación.</p>

      <form class="auth__form" @submit.prevent="enviar">
        <TextField
          v-model="email"
          label="Correo"
          type="email"
          placeholder="mod@acopio.ve"
          autocomplete="email"
        />
        <TextField
          v-model="password"
          label="Contraseña"
          type="password"
          autocomplete="current-password"
        />
        <p v-if="error" class="auth__error">{{ error }}</p>
        <AppButton type="submit" block size="lg" :loading="enviando">Entrar</AppButton>
      </form>
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
  gap: var(--sp-4);
  margin-top: var(--sp-6);
}
.auth__error {
  font-size: var(--fs-sm);
  color: var(--c-danger);
}
</style>
