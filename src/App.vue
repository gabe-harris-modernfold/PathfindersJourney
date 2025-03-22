<template>
  <div class="app-wrapper">
    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Tangerine:wght@400;700&display=swap');
@import '@/assets/scss/main.scss';

// Global styles
body {
  margin: 0;
  padding: 0;
  font-family: 'Cinzel', serif;
}

// Reset some default styles
* {
  box-sizing: border-box;
}

// Utility classes
.text-center {
  text-align: center;
}

.mt-2 {
  margin-top: 2rem;
}

.mb-2 {
  margin-bottom: 2rem;
}
</style>