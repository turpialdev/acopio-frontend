<script setup lang="ts"></script>

<template>
  <footer class="footer">
    <div class="content footer__inner">
      <p class="footer__title">Acopio Venezuela</p>
      <p class="footer__note">
        Coordinación de ayuda humanitaria · Emergencia 24 jun 2026
      </p>

      <ul class="footer__tips">
        <li>
          📲 Comparte centros por SMS/WhatsApp con el botón de copiar en cada tarjeta.
        </li>
        <li>
          ⚠ La información mostrada es suministrada por usuarios de la aplicación. Verifica los
          datos directamente con cada centro antes de movilizar donaciones o tomar decisiones
          críticas.
        </li>
        <li>
          📦 Las donaciones serán entregadas por los clubes de pádel a la alcaldía correspondiente
          a su municipio o a los entes pertinentes.
        </li>
      </ul>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: auto;
  border-top: 1px solid var(--c-border);
  background: var(--c-surface);
}
.footer__inner {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  padding-block: var(--sp-6) var(--sp-8);
  text-align: center;
}
.footer__title {
  font-weight: var(--fw-semibold);
}
.footer__note {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}
.footer__tips {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  border-top: 1px solid var(--c-border);
  padding-top: var(--sp-4);
  text-align: left;
}
.footer__tips li {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
  line-height: 1.55;
}
</style>
