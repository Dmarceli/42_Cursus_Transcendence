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

onMounted(() => {
  console.log('Mounted Pong');
  socket.emit('PlayerEntered')

  window.addEventListener('resize', onWidthChange)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  init_values()
  start_animation()
})

onUnmounted(() => {
  console.log('Unmounting Pong')
  window.removeEventListener('resize', onWidthChange)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

function isBallInsideHorizontalWalls() {
  if (gamecanvas.value != null && ball != null) {
    return ball.y + ball.radius < gamecanvas.value.height && ball.y - ball.radius > 0
  } else {
    return false
  }
}

function isBallInsideVerticalWalls() {
  if (gamecanvas.value != null && ball != null) {
    return ball.x + ball.radius < gamecanvas.value.width && ball.x - ball.radius > 0
  } else {
    return false
  }
}

function areColliding(circle: Circle, rectangle: Rectangle) {
  let closestX =
    circle.x < rectangle.x
      ? rectangle.x
      : circle.x > rectangle.x + rectangle.width
      ? rectangle.x + rectangle.width
      : circle.x
  let closestY =
    circle.y < rectangle.y
      ? rectangle.y
      : circle.y > rectangle.y + rectangle.height
      ? rectangle.y + rectangle.height
      : circle.y
  let dx = closestX - circle.x
  let dy = closestY - circle.y
  return dx * dx + dy * dy <= circle.radius * circle.radius
}

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
        if (animation != null && !isBallInsideVerticalWalls()) {
          cancelAnimationFrame(animation)
          emit('gameOver')
          return
        }
        if (Date.now() > lastWallCollisionTime + 300 && !isBallInsideHorizontalWalls()) {
          ball.direction.y *= -1
          lastWallCollisionTime = Date.now()
        }
        if (
          Date.now() > lastPaddleCollisionTime + 300 &&
          (areColliding(ball, paddle1) || areColliding(ball, paddle2))
        ) {
          ball.direction.x *= -1
          ball.speed *= 1.1
          lastPaddleCollisionTime = Date.now()
        }
        ball.updatePosition(delta)
        paddle1.updatePosition(gamecanvas.value.height)
        paddle2.updatePosition(gamecanvas.value.height)
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



socket.on('updatePlayers', y => {
  paddle1.y = y
});

</script>
