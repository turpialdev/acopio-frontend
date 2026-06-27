<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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
    router.push({ name: 'panel-centro' })
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
  <div class="page">
    <div class="content wrap">
      <!-- Volver -->
      <button class="back" type="button" @click="router.push({ name: 'home' })">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Volver al inicio
      </button>

      <!-- Card -->
      <form class="card" @submit.prevent="enviar">
        <div class="card__head">
          <h1 class="card__title">Administrar Centro de acopio</h1>
          <p class="card__sub">Ingresa el código que recibiste al registrar tu centro de acopio.</p>
        </div>

        <!-- Campo código con ícono candado -->
        <div class="field">
          <label class="field__label">
            Código centro de acopio<span class="field__req" aria-hidden="true">*</span>
          </label>
          <div class="field__wrap">
            <svg class="field__icon" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="3" y="8" width="12" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M6 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input
              v-model="codigo"
              class="field__input"
              :class="{ 'has-error': error }"
              type="text"
              placeholder="XAQ123"
              autocomplete="off"
              aria-label="Código centro de acopio"
            />
          </div>
          <span v-if="error" class="field__error">{{ error }}</span>
        </div>

        <!-- Ingresar -->
        <button type="submit" class="btn-ingresar" :disabled="enviando">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M16.6667 15.8333V4.16666C16.6667 3.94565 16.5789 3.73375 16.4226 3.57747C16.2663 3.42119 16.0544 3.33333 15.8334 3.33333H12.5001C12.0398 3.33333 11.6667 2.96023 11.6667 2.5C11.6667 2.03976 12.0398 1.66666 12.5001 1.66666H15.8334C16.4965 1.66666 17.1322 1.93025 17.601 2.39909C18.0698 2.86793 18.3334 3.50362 18.3334 4.16666V15.8333C18.3334 16.4964 18.0698 17.1321 17.601 17.6009C17.1322 18.0697 16.4965 18.3333 15.8334 18.3333H12.5001C12.0398 18.3333 11.6667 17.9602 11.6667 17.5C11.6667 17.0398 12.0398 16.6667 12.5001 16.6667H15.8334C16.0544 16.6667 16.2663 16.5788 16.4226 16.4225C16.5789 16.2662 16.6667 16.0543 16.6667 15.8333ZM7.74422 5.24414C8.04932 4.93904 8.53182 4.92021 8.85913 5.18717L8.92261 5.24414L13.0893 9.4108C13.4147 9.73624 13.4147 10.2638 13.0893 10.5892L8.92261 14.7559C8.59717 15.0813 8.06966 15.0813 7.74422 14.7559C7.41878 14.4304 7.41878 13.9029 7.74422 13.5775L10.4884 10.8333H2.50008C2.03984 10.8333 1.66675 10.4602 1.66675 10C1.66675 9.53976 2.03984 9.16666 2.50008 9.16666H10.4884L7.74422 6.42252L7.68726 6.35905C7.4203 6.03174 7.43913 5.54923 7.74422 5.24414Z" fill="white"/>
          </svg>
          {{ enviando ? 'Ingresando…' : 'Ingresar' }}
        </button>

        <div class="divider" />

        <!-- Registrar -->
        <div class="alt">
          <span class="alt__text">¿Aún no tienes centro?</span>
          <button type="button" class="alt__link" @click="router.push({ name: 'registrar' })">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 2L2 8v10h5v-5h6v5h5V8L10 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>
            Registrar centro de acopio
          </button>
        </div>
      </form>
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
.card__sub {
  margin-top: var(--sp-1);
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
  line-height: 1.5;
}

/* Campo */
.field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}
.field__label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--c-text);
}
.field__req { color: var(--c-danger); margin-left: 2px; }
.field__wrap { position: relative; }
.field__icon {
  position: absolute;
  left: var(--sp-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--c-text-faint);
  pointer-events: none;
}
.field__input {
  width: 100%;
  padding: var(--sp-3) var(--sp-4) var(--sp-3) var(--sp-10);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-lg);
  background: var(--c-surface);
  font-size: var(--fs-base);
  color: var(--c-text);
  transition: border-color 0.15s;
}
.field__input:focus { outline: none; border-color: #2563eb; }
.field__input.has-error { border-color: var(--c-danger); }
.field__error { font-size: var(--fs-xs); color: var(--c-danger); }

/* Botón ingresar */
.btn-ingresar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  width: 100%;
  padding: var(--sp-4);
  background: #2563eb;
  border: none;
  border-radius: var(--r-lg);
  color: #fff;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: background 0.15s;
}
.btn-ingresar:hover:not(:disabled) { background: #1d4ed8; }
.btn-ingresar:disabled { opacity: 0.7; cursor: not-allowed; }

/* Divisor */
.divider {
  height: 1px;
  background: var(--c-border);
  margin-block: var(--sp-1);
}

/* Alt registrar */
.alt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
}
.alt__text {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}
.alt__link {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  background: none;
  border: none;
  color: #2563eb;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  cursor: pointer;
}
.alt__link:hover { text-decoration: underline; }
</style>
