<template>
  <div v-if="startmenu" class="start-menu">
    <StartMenu class="start-menu"></StartMenu>
  </div>
  <div v-else class="board">
    <Pong2D/>
  </div>
</template>

<script setup lang="ts">
import Pong2D from '../components/Pong2D.vue'
import StartMenu from '../components/StartMenu.vue'
import { ref } from 'vue'

let startmenu = ref(true)

</script>

<style scoped>
.board {
  padding-top: 5%;
  height: 100%;
  width: 100%;
  display: flex;
}

.start-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 95%;
  margin: 0;
  aspect-ratio: 2;
  min-width: 300px;
}

</style>
