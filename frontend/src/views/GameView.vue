<template>
  <div v-if="startmenu" class="start-menu">
    <img src="../assets/racketas.svg" alt="Green Rackets" />
    <button @click="startmenu = false">Start Game</button>
  </div>
  <div v-else class="board">
    <Pong2D @game-over="startmenu = true" />
  </div>
</template>

<script setup lang="ts">
import Pong2D from '../components/Pong2D.vue'
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
  height: 100%; /* Sets the container height to the full viewport height */
}

.start-menu img {
  max-width: 30%;
  max-height: 30%; /* Set the maximum height to your desired value */
  margin: 10px; /*Adjust the margin as desired */
}

.start-menu button {
  margin: 20px; /* Adjust the margin as desired */
  padding: 1.3em 3em;
  font-size: 20px;
  text-transform: uppercase;
  letter-spacing: 2.5px;
  font-weight: 500;
  color: #000;
  background-color: #fff;
  border: none;
  border-radius: 45px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease 0s;
  cursor: pointer;
  outline: none;
}

button:hover {
  background-color: #23c483;
  box-shadow: 0px 15px 20px rgba(46, 229, 157, 0.4);
  color: #fff;
  transform: translateY(-7px);
}

button:active {
  transform: translateY(-1px);
}
</style>
