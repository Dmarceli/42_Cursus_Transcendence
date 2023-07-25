<template>
  <div v-if="startmenu" class="start-menu">
    <StartMenu></StartMenu>
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
  height: 90%;
  width: 100%;
  display: flex;
}

.start-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

</style>
