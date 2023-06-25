<template>
  <div>
    <canvas height="600" width="1000" class="boards" ref="gamecanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const gamecanvas = ref(null)
let ctx = ref(null)
let animation = null

const ball = {
  x: 0,
  y: 0,
  radius: 0,
  direction: { x: 0, y: 0 },
  speed: 0
}

const paddle1 = {
  x: 0,
  y: 0,
  height: 0,
  movingDown: false,
  movingUp: false
}

const paddle2 = {
  x: 0,
  y: 0,
  height: 0,
  movingDown: false,
  movingUp: false
}

let lastAnimationTime = null
let lastPaddleCollisionTime = 0
let lastWallCollisionTime = 0

onMounted(() => {
  console.log('Mounting Pong')
  window.addEventListener('resize', onWidthChange)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  init()
  start_animation()
})

onUnmounted(() => {
  console.log('Unmounting Pong')
  window.removeEventListener('resize', onWidthChange)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})

function isBallInsideHorizontalWalls() {
  return ball.y + ball.radius < gamecanvas.value.height && ball.y - ball.radius > 0
}

function isBallInsideVerticalWalls() {
  return ball.x + ball.radius < gamecanvas.value.width && ball.x - ball.radius > 0
}

function areColliding(circle, rectangle) {
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

function init() {
  ball.direction.x = 0
  gamecanvas.value.height = window.innerHeight * 0.8
  gamecanvas.value.width = window.innerWidth * 0.8

  ball.x = gamecanvas.value.width / 2
  ball.y = gamecanvas.value.height / 2
  ball.radius = gamecanvas.value.height / 100
  ball.speed = 0.4

  while (Math.abs(ball.direction.x) <= 0.4 || Math.abs(ball.direction.x) >= 0.9) {
    const angle = randomNumberBetween(0, 2 * Math.PI)
    ball.direction = { x: Math.cos(angle), y: Math.sin(angle) }
  }

  paddle1.width = 20
  paddle1.height = 100
  paddle1.x = 20
  paddle1.y = gamecanvas.value.height / 2 - paddle1.height / 2

  paddle2.width = paddle1.width
  paddle2.height = paddle1.height
  paddle2.x = gamecanvas.value.width - paddle1.x - paddle2.width
  paddle2.y = paddle1.y

  ctx.value = gamecanvas.value.getContext('2d')
}

function start_animation() {
  animation = requestAnimationFrame(animate)
  function animate(time: DOMHighResTimeStamp) {
    if (lastAnimationTime != null) {
      const delta = time - lastAnimationTime
      if (!isBallInsideVerticalWalls()) {
        cancelAnimationFrame(animation)
        return
      }
      if (Date.now() > lastWallCollisionTime + 300 && !isBallInsideHorizontalWalls()) {
        ball.direction.y *= -1
        lastWallCollisionTime = Date.now()
      }
      if (Date.now() > lastPaddleCollisionTime + 300 && (areColliding(ball, paddle1) || areColliding(ball, paddle2))) {
        ball.direction.x *= -1
        lastPaddleCollisionTime = Date.now()
      }
      ball.x += ball.direction.x * ball.speed * delta
      ball.y += ball.direction.y * ball.speed * delta
      if (paddle1.movingDown == true && paddle1.y + paddle1.height + 15 < gamecanvas.value.height) {
        paddle1.y += 15
      } else if (paddle1.movingUp == true && paddle1.y > 0) {
        paddle1.y -= 15
      }
      if (paddle2.movingDown == true && paddle2.y + paddle2.height + 15 < gamecanvas.value.height) {
        paddle2.y += 20
      } else if (paddle2.movingUp == true && paddle2.y > 0) {
        paddle2.y -= 20
      }
      resetBoard()
      drawBall()
      drawPaddles()
    }
    lastAnimationTime = time
    animation = requestAnimationFrame(animate)
  }
}

function startBoard() {
  ctx.value.fillStyle = 'hsla(155, 40%, 40%, 0.3)'
  ctx.value.fillRect(0, 0, gamecanvas.value.width, gamecanvas.value.height)
}

function clearBoard() {
  ctx.value.reset()
}

function resetBoard() {
  clearBoard()
  startBoard()
}

function drawBall() {
  ctx.value.fillStyle = 'hsla(0, 0%, 100%, 1)'
  ctx.value.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
  ctx.value.fill()
}

function drawPaddles() {
  ctx.value.fillStyle = 'hsla(0, 0%, 100%, 1)'
  ctx.value.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height)
  ctx.value.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height)
}

function onWidthChange() {
  init()
  resetBoard()
  drawBall()
  drawPaddles()
}

function onKeyDown(event: KeyboardEvent) {
  console.log(event.key)
  const handlers: any = {
    ArrowUp: () => {
      paddle1.movingUp = true
    },
    ArrowDown: () => {
      paddle1.movingDown = true
    },
    w: () => {
      paddle2.movingUp = true
    },
    s: () => {
      paddle2.movingDown = true
    }
  }[event.key]
  handlers?.()
}

function onKeyUp(event: KeyboardEvent) {
  console.log(event.key)
  const handlers: any = {
    ArrowUp: () => {
      paddle1.movingUp = false
    },
    ArrowDown: () => {
      paddle1.movingDown = false
    },
    w: () => {
      paddle2.movingUp = false
    },
    s: () => {
      paddle2.movingDown = false
    }
  }[event.key]
  handlers?.()
}

function randomNumberBetween(min: Number, max: Number) {
  return Math.random() * (max - min) + min
}
</script>
