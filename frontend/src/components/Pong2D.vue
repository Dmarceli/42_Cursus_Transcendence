<template>
  <div class="lobbypage" v-if="lobbyPage">
    <LobbyPage></LobbyPage>
  </div>
  <div class="overlays" v-else>
    <h1 v-if="userDisconnected">{{ reconnecting }}</h1>
    <canvas ref="gamecanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, inject,  onMounted, onUnmounted } from 'vue'
import LobbyPage from './LobbyPage.vue'
import { type Rectangle, Paddle, type Circle, Ball, Score } from './pong-types'
import jwt_decode from 'jwt-decode';

let reconnecting = ref("")

const emit = defineEmits(['gameOver', 'PlayerWon', 'PlayerLost'])

let userDisconnected = ref(false)
const gamecanvas = ref<HTMLCanvasElement | null>(null)
let ctx = ref<CanvasRenderingContext2D | null>(null)
let ball: Circle | null = null
let paddle1: Rectangle | null = null
let paddle2: Rectangle | null = null
let conv_rate: number | null = null
const board_dims = {
  width: 1400,
  height: 700
}
let score: Score | null = null
let lobbyPage = ref(true)
let disconnectedId: number | null = null
let token: string | null = null;
let decodedToken: TokenType;
let userId: string | null = null;
let users_Name: string | null = null;

interface TokenType
{
  id: string
  login: string
}
const socket = inject("socket")

onMounted(() => {
  console.log('Mounted Pong');
  window.addEventListener('resize', onWidthChange)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  token = getCookieValueByName('token');
  if (token)
    decodedToken = jwt_decode(token);
  console.log(decodedToken)
  userId = decodedToken.id;
  users_Name = decodedToken.user.intra_nick;
  console.log("userId "+userId)
  console.log("users_name "+users_Name)
  socket.emit('NewPlayer', users_Name)
})

onUnmounted(() => {
  console.log('Unmounting Pong')
  socket.emit('PlayerExited')
  window.removeEventListener('resize', onWidthChange)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

socket.on('updateGame', game => {
  userDisconnected.value = false
  if (disconnectedId) {
    clearInterval(disconnectedId)
  }
  lobbyPage.value = false
  if (gamecanvas.value) {
    ctx.value = gamecanvas.value.getContext('2d')
  }
  update_conversion_rate()
  if (ball == null || paddle1 == null || paddle2 == null || score == null || ctx.value == null) {
    init_values(game)
  }
  else {
    ball.update(game.ball)
    paddle1.update(game.playerPaddle1)
    paddle2.update(game.playerPaddle2)
    score.update(game.score)
  }
  render_animation()
});

socket.on("PlayerWon", () => {
  emit('PlayerWon')
});

socket.on("PlayerLost", () => {
  emit('PlayerLost')
});

socket.on("PlayerDisconnected", () => {
  userDisconnected.value = true
  let ellipsis = "";
  disconnectedId = setInterval(() => {
    reconnecting.value = "Waiting for other user to reconnect";
    if (ellipsis.length < 3) {
      ellipsis += "."
    }
    else {
      ellipsis = ""
    }
    reconnecting.value += ellipsis
  }, 800);
});

function init_values(game: any) {
  if (gamecanvas.value != null) {
    ctx.value = gamecanvas.value.getContext('2d')
  }
  if (conv_rate != null) {
    score = new Score(game.score, conv_rate)
    ball = new Ball(game.ball, conv_rate)
    paddle1 = new Paddle(game.playerPaddle1, conv_rate)
    paddle2 = new Paddle(game.playerPaddle2, conv_rate)
  }
}

function update_conversion_rate() {
  if (gamecanvas.value != null) {
    let current_wh_ratio = window.innerWidth / innerHeight
    if (current_wh_ratio > 2) {
      gamecanvas.value.height = window.innerHeight * 0.8
      gamecanvas.value.width = window.innerHeight * 0.8 * 2
    } else {
      gamecanvas.value.height = window.innerWidth * 0.8 / 2
      gamecanvas.value.width = window.innerWidth * 0.8
    }
    conv_rate = gamecanvas.value.width / board_dims.width;
  }
}

function render_animation() {
  if (
    ctx.value != null &&
    ball != null &&
    paddle1 != null &&
    paddle2 != null &&
    gamecanvas.value != null
  ) {

    // printAll()
    resetBoard()
    ball.draw(ctx.value)
    paddle1.draw(ctx.value)
    paddle2.draw(ctx.value)
    score?.draw(ctx.value)
  }
}

function startBoard() {
  if (ctx.value != null && gamecanvas.value != null) {
    ctx.value.fillStyle = 'hsla(155, 40%, 40%, 0.3)'
    ctx.value.fillRect(0, 0, gamecanvas.value.width, gamecanvas.value.height)
  }
}

function clearBoard() {
  if (gamecanvas.value && conv_rate && ctx.value) {
    ctx.value.clearRect(0, 0, gamecanvas.value.width * conv_rate, gamecanvas.value.height * conv_rate)
  }
}

function resetBoard() {
  clearBoard()
  startBoard()
}

function onWidthChange() {
  update_conversion_rate()
  if (conv_rate)
  {
    ball?.updateConvRate(conv_rate)
    paddle1?.updateConvRate(conv_rate)
    paddle2?.updateConvRate(conv_rate)
    score?.update_dims(conv_rate)
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (paddle1 != null) {
    console.log(event.key)
    const handlers: any = {
      ArrowUp: () => {
        socket.emit('keydown', "up")
      },
      ArrowDown: () => {
        socket.emit('keydown', "down")
      },
    }[event.key]
    handlers?.()
  }
}

function onKeyUp(event: KeyboardEvent) {
  const handlers: any = {
    ArrowUp: () => {
      socket.emit('keyup', "up")
    },
    ArrowDown: () => {
      socket.emit('keyup', "down")
    },
  }[event.key]
  handlers?.()
}

function printAll() {
  console.log("Ball:")
  console.log("x:" + ball?.x)
  console.log("y:" + ball?.y)
  console.log("radius:" + ball?.radius)
  console.log("Paddle 1:")
  console.log("x:" + paddle1?.x)
  console.log("y:" + paddle1?.y)
  console.log("width:" + paddle1?.width)
  console.log("height:" + paddle1?.height)
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

<style>
.lobbypage {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 rem;
  margin: 0;
  height: 100%;
  width: 100%;
}

.overlays {
  padding-top: 5%;
  height: 90%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlays h1 {
  position: absolute;
  z-index: 2;
}

canvas {
  z-index: 1;
}
</style>