<template>
  <div v-if="ShowPlayInstructions()">
    <img src="racketas.svg" alt="" />
    <v-btn class="play-game" @click="clickedPlay = true">Let's Play</v-btn>
    <v-btn class="play-game" @click="instructions = true">How to Play</v-btn>
    <InstructionsPage :dialog="instructions" @close-window="instructions = false"></InstructionsPage>
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
import { ref, inject, watch } from 'vue'
import { Socket } from 'socket.io-client'
import PaddleCarousel from './PaddleCarousel.vue'
import InstructionsPage from './InstructionsPage.vue'
import { State } from '@/helpers/state';

let instructions = ref(false)
let clickedPlay = ref(false)

interface Props {
  intraNick: string | null
  gameState: State
}
const props = defineProps<Props>()

const emits = defineEmits(['PlayerCreated', "closeInstructions"])

const socket: Socket | undefined = inject('socket')

function ShowPlayInstructions() {
  return props.gameState != State.SETTING_PRIVATE_GAME && !clickedPlay.value;
}

function selectPaddle(paddleSkin: string) {
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
  margin-top: 2%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
