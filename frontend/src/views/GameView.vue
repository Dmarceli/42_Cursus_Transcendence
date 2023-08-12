<template>
  <div v-if="startmenu" class="start-menu">
    <StartMenu @player-created="handlePlayerCreated" :is-private-game="isPrivateGame" :intra-nick="users_Name" class="start-menu"></StartMenu>
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
    <Pong2D :is-private-game="isPrivateGame" :intra-nick="users_Name" @player-won="playerWon = true" @player-lost="playerLost = true"/>
  </div>
</template>

<script setup lang="ts">
import Pong2D from '../components/Pong2D.vue'
import StartMenu from '../components/StartMenu.vue'
import { ref, onMounted, inject } from 'vue'
import jwt_decode from 'jwt-decode';
import type { Socket } from 'socket.io-client';
import { onBeforeMount } from 'vue';

let startmenu = ref(true)
let playerWon = ref(false)
let playerLost = ref(false)
let token: string | null = null;
let decodedToken: TokenType;
let users_Name = ref("");
let isPrivateGame = ref(false)
const socket: Socket | undefined = inject('socket')

interface Props {
  id: number
}
const props = defineProps<Props>()

interface TokenType
{
  user: {
    intra_nick: string,
    nick: string,
    id: number
  },
  id: number,
  iat: number,
  exp: number
}

onBeforeMount(async () => {
  const response = await fetch(process.env.VUE_APP_BACKEND_URL +'/games/private');
  if (response.ok) {
    let games = await response.json();
    console.log("GAMES ARE "+games);
    let existing_private_game = games.find((privateGame: any) => {
      console.log("GAME P1 is "+privateGame.player1)
      console.log("GAME P2 is "+privateGame.player2)
      return (privateGame.player1 == users_Name.value || privateGame.player2 == users_Name.value)
    });
    console.log("EXISTING PRIVATE GAME "+existing_private_game);
    if (!existing_private_game)
    {
      console.log("PRIVATE GAME IS FALSE")
      isPrivateGame.value = false;
      return ;
    }
    console.log("PRIVATE GAME IS TRUE")
    isPrivateGame.value = true;
    return ;
  }
})

onMounted(() => {
  console.log('Mounted Game View');
  token = getCookieValueByName('token');
  if (token)
    decodedToken = jwt_decode(token);
  users_Name.value = decodedToken.user.intra_nick;
  playerWon.value=false
  playerLost.value=false
  console.log("users_name "+users_Name)
})

function handlePlayerCreated()
{
  startmenu.value=false
  playerWon.value=false
  playerLost.value=false

}

function ResetView()
{
  startmenu.value=true
  isPrivateGame.value=false
  playerWon.value=false
  playerLost.value=false
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
