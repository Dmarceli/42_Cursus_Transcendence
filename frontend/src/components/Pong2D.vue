<template>
  <div class="lobbypage" v-if="lobbyPage">
    <Lobby></Lobby>
  </div>
  <div v-else>
    <canvas class="boards" ref="gamecanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Lobby from './Lobby.vue'
import { type Rectangle, Paddle, type Circle, Ball, Score } from '../types'
import { io } from 'socket.io-client'

const socket = io(process.env.VUE_APP_BACKEND_URL);

const emit = defineEmits(['gameOver'])

const gamecanvas = ref<HTMLCanvasElement | null>(null)
let ctx = ref<CanvasRenderingContext2D | null>(null)
let animation: number | null = null
let ball: Circle | null = null
let paddle1: Rectangle | null = null
let paddle2: Rectangle | null = null
let gameover: boolean | null = null
const board_dims = {
  width: 1400,
  height: 700
}
let score: Score | null = null
let lobbyPage = ref(true)

onMounted(() => {
  console.log('Mounted Pong');
  socket.emit('NewPlayer')
  window.addEventListener('resize', onWidthChange)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

})

onUnmounted(() => {
  console.log('Unmounting Pong')
  socket.emit('PlayerExited')
  window.removeEventListener('resize', onWidthChange)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

socket.on('updateGame', game => {
  lobbyPage.value=false
  if (ball == null || paddle1 == null || paddle2 == null || score == null) {
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

socket.on('WaitingForPlayers', () => {
  lobbyPage.value = true
});

function init_values(game: any) {
  if (gamecanvas.value != null) {
    let current_wh_ratio = window.innerWidth / innerHeight
    if (current_wh_ratio > 2) {
      gamecanvas.value.height = window.innerHeight * 0.8
      gamecanvas.value.width = window.innerHeight * 0.8 * 2
    } else {
      gamecanvas.value.height = window.innerWidth * 0.8 / 2
      gamecanvas.value.width = window.innerWidth * 0.8
    }
    ctx.value = gamecanvas.value.getContext('2d')
    let conv_rate = gamecanvas.value.width / board_dims.width;
    ball = new Ball(game.ball, conv_rate)
    paddle1 = new Paddle(game.playerPaddle1, conv_rate)
    paddle2 = new Paddle(game.playerPaddle2, conv_rate)
    score = new Score(game.score, gamecanvas.value)
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
    if (animation != null && gameover) {
      cancelAnimationFrame(animation)
      emit('gameOver')
      return
    }
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
  if (gamecanvas.value != null) {
    ctx.value?.clearRect(0, 0, gamecanvas.value.width, gamecanvas.value.height)
  }
}

function resetBoard() {
  clearBoard()
  startBoard()
}

function onWidthChange() {
  if (gamecanvas.value && ball) {
    ball.conv_rate = gamecanvas.value.width / 1700 * 0.8;
  }
  resetBoard()
  if (ctx.value != null) {
    ball?.draw(ctx.value)
    paddle1?.draw(ctx.value)
    paddle2?.draw(ctx.value)
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
</style>