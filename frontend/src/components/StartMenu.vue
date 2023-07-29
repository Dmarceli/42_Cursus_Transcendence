<template>
  <div v-if="PlayGame">
    <img src="racketas.svg" alt="" />
    <v-btn class="play-game" @click="PlayGame = false">Let's Play</v-btn>
  </div>
  <div v-else class="start-menu">
    <v-card elevation="18" class="testclass">
      <div class="carousel">
        <PaddleCarousel @chose-paddle="selectPaddle" class="carousel2"></PaddleCarousel>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { Socket } from 'socket.io-client'
import PaddleCarousel from './PaddleCarousel.vue'

let PlayGame = ref(true)

interface Props {
  intraNick: string | null
}
const props = defineProps<Props>()

const emits = defineEmits(['PlayerCreated'])

let joinLobbyView = ref(false)
let choosePaddle = ref(true)

const socket: Socket | undefined = inject('socket')

function selectPaddle(paddleSkin: string) {
  console.log(props.intraNick)
  socket?.emit('PlayerSelectedPaddle', props.intraNick, paddleSkin)
}

socket?.on('PlayerCreated', () => {
  emits('PlayerCreated')
})
</script>

<style scoped>
.v-card.elevation-18 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5%;
  width: 100%;
  height: 100%;
}

.start-menu button {
  padding: 2% 4%;
  font-size: 100%;
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  color: #fff;
  background-color: #e91e63;
  border: none;
  border-radius: 45px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease 0s;
  cursor: pointer;
  outline: none;
}

/* background-color: #E91E63;
  box-shadow: 0px 15px 20px rgba(233, 30, 99, 0.4);
  color: #fff; */

.start-menu button:hover {
  background-color: #fff;
  box-shadow: 0px 15px 20px rgba(255, 255, 255, 0.4);
  color: #e91e63;
  transform: translateY(-7px);
}

.start-menu button:active {
  transform: translateY(-1px);
}

.start-menu img {
  width: 20%;
  margin: 5%;
}

.join-lobby {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.carousel {
  width: 100%;
  height: 100%;
}

.carousel2 {
  height: 80%;
}

.v-card.testclass {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

button.play-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
