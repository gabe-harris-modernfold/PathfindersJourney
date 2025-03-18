<template>
  <div class="game-layout" style="border: 2px solid lightblue; position: relative;">
    <div style="position: absolute; top: -20px; left: 0; background-color: lightblue; padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070;">GameLayout</div>
    <main class="game-layout__content">
      <slot></slot>
    </main>
    
    <footer class="game-layout__footer">
      <p>&copy; 2025 Pathfinder's Journey</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// No props or special logic needed for this basic layout component
</script>

<style lang="scss" scoped>
.game-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-image: url('@/assets/images/celtic-background.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  
  &__content {
    flex: 1;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }
  
  &__footer {
    padding: 1rem;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    text-align: center;
    font-size: 0.8rem;
  }
}
</style>
