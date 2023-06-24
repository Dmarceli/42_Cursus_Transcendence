<script setup lang="ts">
import Pong2D from '../components/Pong2D.vue'
</script>

<template>
  <div class="board">
    <Pong2D />
  </div>
</template>

<style scoped>
.board {
  padding-top: 5%;
  height: 90%;
  width: 100%;
  display: flex;
}
</style>
