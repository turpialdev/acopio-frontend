<script setup lang="ts"></script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <p class="footer__title">Acopio Venezuela</p>
      <p class="footer__note">
        Coordinación de ayuda humanitaria · Emergencia 24 jun 2026
      </p>
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
  padding-block: var(--sp-6);
  text-align: center;
}
.footer__title {
  font-weight: var(--fw-semibold);
}
.footer__note {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}
</style>
