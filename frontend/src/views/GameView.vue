<template>
  <div v-if="gameState < 2" class="start-menu">
    <StartMenu :game-state="gameState" :intra-nick="users_Name" class="start-menu"></StartMenu>
  </div>
  <div v-else-if="playerWon">
    <h1>You Won</h1>
    <v-btn @click="ResetView">
      Start Menu
    </v-btn>
  </div>
  <div v-else-if="playerLost">
    <h1>You Lost</h1>
    <v-btn @click="ResetView">
      Start Menu
    </v-btn>
  </div>
  <div v-else class="board">
    <Pong2D :game-state="gameState" :intra-nick="users_Name" @player-won="playerWon = true"
      @player-lost="playerLost = true" />
  </div>
</template>

<script setup lang="ts">
import Pong2D from '../components/Pong2D.vue'
import StartMenu from '../components/StartMenu.vue'
import { ref, onMounted, inject } from 'vue'
import jwt_decode from 'jwt-decode';
import { onBeforeMount } from 'vue';
import type { Socket } from 'socket.io-client';
import { StateMessage, type State } from '@/helpers/state';

let playerWon = ref(false)
let playerLost = ref(false)
let token: string | null = null;
let decodedToken: TokenType;
let users_Name = ref("");
let gameState = ref(0)

interface TokenType {
  user: {
    intra_nick: string,
    nick: string,
    id: number
  },
  id: number,
  iat: number,
  exp: number
}

const socket: Socket | undefined = inject('socket')

onBeforeMount(async () => {
  token = getCookieValueByName('token');
  if (token)
    decodedToken = jwt_decode(token);
  users_Name.value = decodedToken.user.intra_nick;
  socket?.emit('GetUpdatedState', users_Name.value)
})

onMounted(() => {
  playerWon.value = false
  playerLost.value = false
})

function ResetView() {
  playerWon.value = false
  playerLost.value = false
  gameState.value = 0
}

function getCookieValueByName(name: any) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.startsWith(`${name}=`)) {
      cookie = cookie.substring(name.length + 1);
      return (cookie);
    }
  }
  return null;
}

socket?.on('UpdatedState', (value: State) => {
  gameState.value = value
})

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
