<template>
  <div>
    <canvas class="boards" ref="gamecanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { type Rectangle, Paddle, type Circle, Ball } from '../types'
import { io } from 'socket.io-client'

const socket = io(process.env.VUE_APP_BACKEND_URL);

const emit = defineEmits(['gameOver'])

const gamecanvas = ref<HTMLCanvasElement | null>(null)
let ctx = ref<CanvasRenderingContext2D | null>(null)
let animation: number | null = null
let ball: Circle | null = null
let paddle1: Rectangle | null = null
let paddle2: Rectangle | null = null
let lastAnimationTime: DOMHighResTimeStamp | null = null
let lastPaddleCollisionTime = 0
let lastWallCollisionTime = 0
let gameover = false

onMounted(() => {
  console.log('Mounted Pong');
  socket.emit('PlayerEntered')
  window.addEventListener('resize', onWidthChange)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})

onUnmounted(() => {
  console.log('Unmounting Pong')
  window.removeEventListener('resize', onWidthChange)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

socket.on('updateGame', game => {
  init_values()
  start_animation()
  ball.update(game.ball.x, game.ball.y, game.ball.radius)
  paddle1.update(game.paddle1.x)
  paddle2.update(gamecanvas.value.height)
});

function init_values() {
  if (gamecanvas.value != null) {
    gamecanvas.value.height = window.innerHeight * 0.8
    gamecanvas.value.width = window.innerWidth * 0.8
    ctx.value = gamecanvas.value.getContext('2d')
    ball = new Ball(gamecanvas.value)
    paddle1 = new Paddle(gamecanvas.value, 20)
    paddle2 = new Paddle(gamecanvas.value, gamecanvas.value.width - paddle1.x - paddle1.width)
  }
}

function start_animation() {
  animation = requestAnimationFrame(animate)
  function animate(time: DOMHighResTimeStamp) {
    if (
      ctx.value != null &&
      ball != null &&
      paddle1 != null &&
      paddle2 != null &&
      gamecanvas.value != null
    ) {
      if (lastAnimationTime != null) {
        const delta = time - lastAnimationTime
        if (animation != null && gameover) {
          cancelAnimationFrame(animation)
          emit('gameOver')
          return
        }
        resetBoard()
        ball.draw(ctx.value)
        paddle1.draw(ctx.value)
        paddle2.draw(ctx.value)
      }
      lastAnimationTime = time
      animation = requestAnimationFrame(animate)
    }
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
  init_values()
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

</script>
