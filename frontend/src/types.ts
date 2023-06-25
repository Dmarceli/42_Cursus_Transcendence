import { randomNumberBetween } from './helpers/geometry'

interface Rectangle {
  x: number
  y: number
  height: number
  width: number
  movingDown: Boolean
  movingUp: Boolean
  updatePosition(canvasmax: number): void
}

class Paddle implements Rectangle {
  x: number
  y: number
  height: number
  width: number
  movingDown: Boolean
  movingUp: Boolean

  constructor(canvas: HTMLCanvasElement, x: number) {
    this.height = 100
    this.width = 20
    this.x = x
    this.y = canvas.height / 2 - this.height / 2
    this.movingDown = false
    this.movingUp = false
  }
  updatePosition(canvasmax: number): void {
    if (this.movingDown && this.y + this.height + 15 < canvasmax) {
      this.y += 20
    } else if (this.movingUp && this.y > 0) {
      this.y -= 20
    }
  }
}

interface Circle {
  x: number
  y: number
  radius: number
  direction: { x: number; y: number }
  speed: number
  updatePosition(delta: number): void
}

class Ball implements Circle {
  x: number
  y: number
  radius: number
  direction: { x: number; y: number }
  speed: number

  constructor(canvas: HTMLCanvasElement) {
    this.x = canvas.width / 2
    this.y = canvas.height / 2
    this.radius = canvas.height / 100
    this.direction = { x: 0, y: 0 }
    while (Math.abs(this.direction.x) <= 0.4 || Math.abs(this.direction.x) >= 0.9) {
      const angle = randomNumberBetween(0, 2 * Math.PI)
      this.direction = { x: Math.cos(angle), y: Math.sin(angle) }
    }
    this.speed = 0.5
  }
  updatePosition(delta: number): void {
    this.x += this.direction.x * this.speed * delta
    this.y += this.direction.y * this.speed * delta
  }
}

export { type Rectangle, Paddle, type Circle, Ball }
