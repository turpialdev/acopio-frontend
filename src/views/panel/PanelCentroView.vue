<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import { centros as centrosApi, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'
import type { Ficha, Sugerencia } from '@/types/domain'

const router = useRouter()
const { sesion, esResponsable, cerrarSesion } = useAuth()

const ficha = ref<Ficha | null>(null)
const sugerencias = ref<Sugerencia[]>([])
const cargando = ref(true)
const error = ref('')

const subtitulo = computed(() =>
  ficha.value ? `${ficha.value.municipio}, ${ficha.value.estado}` : '',
)

const ICON_EDITAR = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M17.5 15.8336L17.5855 15.8376C18.0056 15.8804 18.3333 16.2355 18.3333 16.6669C18.3332 17.0982 18.0055 17.4525 17.5855 17.4954L17.5 17.5002H10C9.53985 17.5002 9.1668 17.127 9.16668 16.6669C9.16668 16.2067 9.53978 15.8336 10 15.8336H17.5ZM15.8333 4.26944C15.8333 4.02136 15.7345 3.78327 15.5591 3.60782C15.3836 3.43236 15.1456 3.33357 14.8975 3.33357C14.6493 3.33357 14.4113 3.43236 14.2359 3.60782L13.6776 4.16609L15.0008 5.48933L15.5591 4.93106C15.7345 4.75566 15.8333 4.51749 15.8333 4.26944ZM4.2269 13.6168C4.12795 13.7157 4.05542 13.8381 4.01613 13.9724L3.52948 15.6358L5.1937 15.1508H5.19451C5.32911 15.1116 5.45183 15.0391 5.55096 14.94L13.8224 6.66771L12.4992 5.34447L4.2269 13.6168ZM17.5 4.26944C17.4999 4.95951 17.2254 5.62149 16.7375 6.10945L6.72934 16.1184C6.46907 16.3787 6.15477 16.5774 5.80975 16.7019L5.66082 16.7507L3.26743 17.449C3.05238 17.5117 2.82444 17.5159 2.60744 17.4604C2.39043 17.4048 2.19214 17.2916 2.03371 17.1332C1.87527 16.9748 1.76218 16.7765 1.70656 16.5595C1.65098 16.3425 1.6545 16.1145 1.71714 15.8995L2.41619 13.5061V13.5053C2.53398 13.1021 2.75146 12.7353 3.04852 12.4384L13.0575 2.42943C13.5455 1.94142 14.2073 1.66691 14.8975 1.6669C15.5876 1.6669 16.2495 1.94141 16.7375 2.42943C17.2254 2.91744 17.5 3.57933 17.5 4.26944Z" fill="#585858"/></svg>`
const ICON_INSUMOS = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2.5081 14.1667C2.96833 14.1667 3.34143 14.5398 3.34143 15C3.34143 15.4602 2.96833 15.8333 2.5081 15.8333H2.49996C2.03972 15.8333 1.66663 15.4602 1.66663 15C1.66663 14.5398 2.03972 14.1667 2.49996 14.1667H2.5081ZM17.5 14.1667C17.9602 14.1667 18.3333 14.5398 18.3333 15C18.3333 15.4602 17.9602 15.8333 17.5 15.8333H6.66663C6.20639 15.8333 5.83329 15.4602 5.83329 15C5.83329 14.5398 6.20639 14.1667 6.66663 14.1667H17.5ZM2.5081 9.16667C2.96833 9.16667 3.34143 9.53977 3.34143 10C3.34143 10.4602 2.96833 10.8333 2.5081 10.8333H2.49996C2.03972 10.8333 1.66663 10.4602 1.66663 10C1.66663 9.53977 2.03972 9.16667 2.49996 9.16667H2.5081ZM17.5 9.16667C17.9602 9.16667 18.3333 9.53977 18.3333 10C18.3333 10.4602 17.9602 10.8333 17.5 10.8333H6.66663C6.20639 10.8333 5.83329 10.4602 5.83329 10C5.83329 9.53977 6.20639 9.16667 6.66663 9.16667H17.5ZM2.5081 4.16667C2.96833 4.16667 3.34143 4.53977 3.34143 5.00001C3.34143 5.46024 2.96833 5.83334 2.5081 5.83334H2.49996C2.03972 5.83334 1.66663 5.46024 1.66663 5.00001C1.66663 4.53977 2.03972 4.16667 2.49996 4.16667H2.5081ZM17.5 4.16667C17.9602 4.16667 18.3333 4.53977 18.3333 5.00001C18.3333 5.46024 17.9602 5.83334 17.5 5.83334H6.66663C6.20639 5.83334 5.83329 5.46024 5.83329 5.00001C5.83329 4.53977 6.20639 4.16667 6.66663 4.16667H17.5Z" fill="#585858"/></svg>`
const ICON_VOLUNTARIOS = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16.6667 15C16.6667 14.0795 15.9205 13.3333 15 13.3333C14.0796 13.3333 13.3334 14.0795 13.3334 15C13.3334 15.9205 14.0796 16.6667 15 16.6667C15.9205 16.6667 16.6667 15.9205 16.6667 15ZM11.6667 6.66666C11.6667 4.82571 10.1743 3.33333 8.33337 3.33333C6.49242 3.33333 5.00004 4.82571 5.00004 6.66666C5.00004 8.50761 6.49242 10 8.33337 10C10.1743 10 11.6667 8.50761 11.6667 6.66666ZM18.3334 15C18.3334 15.1476 18.3227 15.2928 18.3041 15.4354L18.4221 15.4883L18.4978 15.5273C18.8644 15.737 19.0204 16.1943 18.8453 16.5885C18.67 16.9828 18.2261 17.1734 17.8247 17.0418L17.745 17.0117L17.6791 16.9824C17.4825 17.2476 17.2477 17.4825 16.9825 17.679L17.0118 17.745L17.0419 17.8247C17.1735 18.226 16.9828 18.67 16.5886 18.8452C16.1943 19.0204 15.737 18.8644 15.5274 18.4977L15.4883 18.422L15.4354 18.304C15.2929 18.3226 15.1477 18.3333 15 18.3333C14.8522 18.3333 14.7066 18.3227 14.5638 18.304L14.5118 18.422C14.3248 18.8425 13.832 19.0321 13.4115 18.8452C12.991 18.6583 12.8015 18.1655 12.9883 17.745L13.0168 17.679C12.7517 17.4824 12.5167 17.2476 12.3202 16.9824L12.2551 17.0117C11.8345 17.1985 11.3417 17.0091 11.1548 16.5885C10.968 16.168 11.1575 15.6752 11.578 15.4883L11.6952 15.4354C11.6766 15.2929 11.6667 15.1476 11.6667 15C11.6667 14.8521 11.6765 14.7066 11.6952 14.5638L11.578 14.5117L11.5023 14.4727C11.1357 14.263 10.9796 13.8057 11.1548 13.4115C11.3417 12.9909 11.8345 12.8015 12.2551 12.9883L12.3202 13.0168C12.5167 12.7517 12.7517 12.5167 13.0168 12.3201L12.9883 12.255C12.8015 11.8345 12.991 11.3417 13.4115 11.1548C13.8058 10.9796 14.263 11.1356 14.4727 11.5023L14.5118 11.578L14.5638 11.6951C14.7066 11.6765 14.8522 11.6667 15 11.6667C15.1476 11.6667 15.2929 11.6766 15.4354 11.6951L15.4883 11.578C15.6753 11.1575 16.1681 10.9679 16.5886 11.1548C17.0091 11.3417 17.1986 11.8345 17.0118 12.255L16.9825 12.3201C17.2477 12.5166 17.4825 12.7516 17.6791 13.0168L17.745 12.9883C18.1655 12.8015 18.6584 12.9909 18.8453 13.4115C19.0321 13.832 18.8425 14.3248 18.4221 14.5117L18.3041 14.5638C18.3227 14.7066 18.3334 14.8521 18.3334 15ZM13.3334 6.66666C13.3334 8.39458 12.4565 9.9173 11.1239 10.8154C11.2027 10.9948 11.2199 11.2025 11.1556 11.4038C11.0156 11.842 10.5466 12.084 10.1083 11.9442C9.23375 11.6649 8.30533 11.5953 7.39913 11.7423C6.49311 11.8893 5.63471 12.2484 4.89343 12.7897C4.15205 13.3311 3.54818 14.0399 3.13236 14.8584C2.71658 15.6768 2.50014 16.582 2.50004 17.5C2.5 17.9602 2.12691 18.3333 1.66671 18.3333C1.2065 18.3333 0.833373 17.9602 0.833374 17.5C0.833483 16.3197 1.11255 15.1555 1.64718 14.1032C2.18179 13.0511 2.95729 12.1397 3.91036 11.4437C4.34535 11.126 4.81187 10.8576 5.30115 10.6413C4.10542 9.72766 3.33337 8.28767 3.33337 6.66666C3.33337 3.90524 5.57195 1.66666 8.33337 1.66666C11.0948 1.66666 13.3334 3.90524 13.3334 6.66666Z" fill="#585858"/></svg>`

const ACCIONES_RESPONSABLE = [
  { label: 'Editar Ficha del centro', to: 'panel-ficha', icon: ICON_EDITAR },
  { label: 'Administrar insumos', to: 'inventario', icon: ICON_INSUMOS },
  { label: 'Administrar Voluntarios', to: 'panel-codigos', icon: ICON_VOLUNTARIOS },
]

const ACCIONES_VOLUNTARIO = [
  { label: 'Administrar insumos', to: 'inventario', icon: ICON_INSUMOS },
]

const acciones = computed(() =>
  esResponsable.value ? ACCIONES_RESPONSABLE : ACCIONES_VOLUNTARIO,
)

function salir() {
  cerrarSesion()
  router.push({ name: 'home' })
}

onMounted(async () => {
  const id = sesion.centroId
  if (!id) {
    error.value = 'Sesión sin centro asociado.'
    cargando.value = false
    return
  }
  try {
    const [f, s] = await Promise.all([
      centrosApi.obtenerFicha(id),
      centrosApi.obtenerSugerencias(id).catch(() => ({ sugerencias: [] })),
    ])
    ficha.value = f
    sugerencias.value = s.sugerencias
  } catch (e) {
    error.value = e instanceof ApiError ? e.firstMessage : 'No se pudo cargar el panel.'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="panel-wrap">
    <AppSpinner v-if="cargando" label="Cargando panel…" class="spinner" />

    <template v-else>
      <p v-if="error" class="error">{{ error }}</p>

      <!-- Card principal -->
      <div class="card">
        <!-- Nombre del centro -->
        <div class="card__head">
          <h1 class="card__title">Administrar Centro de Acopio</h1>
          <p v-if="ficha" class="card__sub">{{ ficha.nombre }} · {{ subtitulo }}</p>
        </div>

        <!-- Sugerencias (solo responsable) -->
        <div v-if="esResponsable && sugerencias.length" class="sugerencias">
          <div v-for="s in sugerencias" :key="s.categoria_id" class="sug">
            <p class="sug__cat">{{ s.categoria_nombre }}</p>
            <p class="sug__msg">{{ s.mensaje }}</p>
          </div>
        </div>

        <!-- Lista de acciones -->
        <nav class="acciones">
          <button
            v-for="a in acciones"
            :key="a.label"
            class="accion"
            @click="router.push({ name: a.to })"
          >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span class="accion__icon" v-html="a.icon" />
            <span class="accion__label">{{ a.label }}</span>
          </button>
        </nav>
      </div>

      <!-- Botón reporte -->
      <button class="btn-reporte" @click="router.push({ name: 'movimientos' })">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M6.6748 12.5C7.13504 12.5 7.50814 12.8731 7.50814 13.3333C7.50814 13.7936 7.13504 14.1667 6.6748 14.1667H6.66667C6.20643 14.1667 5.83333 13.7936 5.83333 13.3333C5.83333 12.8731 6.20643 12.5 6.66667 12.5H6.6748ZM13.3333 12.5C13.7936 12.5 14.1667 12.8731 14.1667 13.3333C14.1667 13.7936 13.7936 14.1667 13.3333 14.1667H10C9.53976 14.1667 9.16667 13.7936 9.16667 13.3333C9.16667 12.8731 9.53976 12.5 10 12.5H13.3333ZM6.6748 8.33333C7.13504 8.33333 7.50814 8.70643 7.50814 9.16667C7.50814 9.62691 7.13504 10 6.6748 10H6.66667C6.20643 10 5.83333 9.62691 5.83333 9.16667C5.83333 8.70643 6.20643 8.33333 6.66667 8.33333H6.6748ZM13.3333 8.33333C13.7936 8.33333 14.1667 8.70643 14.1667 9.16667C14.1667 9.62691 13.7936 10 13.3333 10H10C9.53976 10 9.16667 9.62691 9.16667 9.16667C9.16667 8.70643 9.53976 8.33333 10 8.33333H13.3333ZM12.5 2.5H7.5V4.16667H12.5V2.5ZM14.1667 4.16667C14.1667 5.08714 13.4205 5.83333 12.5 5.83333H7.5C6.57953 5.83333 5.83333 5.08714 5.83333 4.16667H5C4.77899 4.16667 4.56709 4.25453 4.41081 4.41081C4.25453 4.56709 4.16667 4.77899 4.16667 5V16.6667L4.17074 16.7489C4.18964 16.9397 4.27402 17.1191 4.41081 17.2559C4.56709 17.4121 4.77899 17.5 5 17.5H15C15.221 17.5 15.4329 17.4121 15.5892 17.2559C15.7455 17.0996 15.8333 16.8877 15.8333 16.6667V5C15.8333 4.77899 15.7455 4.56709 15.5892 4.41081C15.4524 4.27402 15.273 4.18964 15.0822 4.17074L15 4.16667H14.1667ZM15 2.5C15.663 2.5 16.2987 2.76358 16.7676 3.23242C17.2364 3.70126 17.5 4.33696 17.5 5V16.6667C17.5 17.3297 17.2364 17.9654 16.7676 18.4342C16.2987 18.9031 15.663 19.1667 15 19.1667H5C4.33696 19.1667 3.70126 18.9031 3.23242 18.4342C2.76358 17.9654 2.5 17.3297 2.5 16.6667V5C2.5 4.33696 2.76358 3.70126 3.23242 3.23242C3.70126 2.76358 4.33696 2.5 5 2.5H5.83333C5.83333 1.57953 6.57953 0.833334 7.5 0.833334H12.5C13.4205 0.833334 14.1667 1.57953 14.1667 2.5H15Z" fill="#2563EB"/>
        </svg>
        Ver Reporte de insumos
      </button>

      <!-- Cerrar sesión -->
      <button class="btn-salir" @click="salir">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M1.66663 15.8333V4.16667C1.66663 3.50363 1.93021 2.86793 2.39905 2.39909C2.86789 1.93025 3.50358 1.66667 4.16663 1.66667H7.49996C7.9602 1.66667 8.33329 2.03976 8.33329 2.5C8.33329 2.96024 7.9602 3.33333 7.49996 3.33333H4.16663C3.94561 3.33333 3.73371 3.42119 3.57743 3.57748C3.42115 3.73376 3.33329 3.94565 3.33329 4.16667V15.8333C3.33329 16.0543 3.42115 16.2662 3.57743 16.4225C3.73371 16.5788 3.94561 16.6667 4.16663 16.6667H7.49996C7.9602 16.6667 8.33329 17.0398 8.33329 17.5C8.33329 17.9602 7.9602 18.3333 7.49996 18.3333H4.16663C3.50358 18.3333 2.86789 18.0698 2.39905 17.6009C1.93021 17.1321 1.66663 16.4964 1.66663 15.8333ZM12.7441 5.24414C13.0492 4.93905 13.5317 4.92022 13.859 5.18718L13.9225 5.24414L18.0892 9.41081C18.4146 9.73625 18.4146 10.2638 18.0892 10.5892L13.9225 14.7559C13.597 15.0813 13.0695 15.0813 12.7441 14.7559C12.4187 14.4304 12.4187 13.9029 12.7441 13.5775L15.4882 10.8333H7.49996C7.03972 10.8333 6.66663 10.4602 6.66663 10C6.66663 9.53976 7.03972 9.16667 7.49996 9.16667H15.4882L12.7441 6.42253L12.6871 6.35905C12.4202 6.03174 12.439 5.54924 12.7441 5.24414Z" fill="#2563EB"/>
        </svg>
        Cerrar sesión
      </button>
    </template>
  </div>
</template>

<style scoped>
.panel-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  max-width: var(--content);
  margin: 0 auto;
  padding: var(--sp-5) var(--sp-4) var(--sp-10);
}

.spinner {
  margin-top: var(--sp-10);
}

.error {
  color: var(--c-danger);
  font-size: var(--fs-sm);
}

/* Card */
.card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.card__head {
  padding: var(--sp-5) var(--sp-5) var(--sp-4);
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
}

/* Sugerencias */
.sugerencias {
  margin: 0 var(--sp-5) var(--sp-3);
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.sug {
  padding: var(--sp-3) var(--sp-4);
  background: var(--c-warning-soft);
  border: 1px solid var(--c-warning);
  border-radius: var(--r-lg);
}

.sug__cat {
  font-weight: var(--fw-bold);
  font-size: var(--fs-sm);
  color: var(--c-warning);
}

.sug__msg {
  font-size: var(--fs-sm);
  margin-top: 2px;
}

/* Acciones */
.acciones {
  display: flex;
  flex-direction: column;
  padding: 0 var(--sp-4) var(--sp-4);
  gap: var(--sp-2);
}

.accion {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  padding: var(--sp-4);
  background: var(--c-surface-2);
  border: none;
  border-radius: var(--r-lg);
  cursor: pointer;
  transition: background 0.15s;
  color: var(--c-text);
}

.accion:hover {
  background: var(--c-border);
}

.accion__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--c-text-muted);
}

.accion__label {
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  color: var(--c-text);
}

/* Botón reporte */
.btn-reporte {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  width: 100%;
  padding: var(--sp-4);
  background: #e6f2fe;
  border: none;
  border-radius: var(--r-xl);
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  color: #2563eb;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-reporte:hover {
  background: #d0e8fd;
}

/* Botón cerrar sesión */
.btn-salir {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  width: 100%;
  padding: var(--sp-4);
  background: var(--c-surface);
  border: 1.5px solid #2563eb;
  border-radius: var(--r-xl);
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  color: #2563eb;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-salir:hover {
  background: #e6f2fe;
}
</style>
