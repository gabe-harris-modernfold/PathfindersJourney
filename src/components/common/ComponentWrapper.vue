<template>
  <div v-component-debug="componentName" class="component-wrapper">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  componentName: string;
}>();
</script>

<style lang="scss" scoped>
.component-wrapper {
  // Component styling is handled by the component-debug mixin
  display: contents;
}
</style>
