import { randomNumberBetween } from './helpers/geometry'

interface Rectangle {
  x: number
  y: number
  height: number
  width: number
  movingDown: Boolean
  movingUp: Boolean
  updatePosition(canvasmax: number): void
  draw(context: CanvasRenderingContext2D): void
}

class Paddle implements Rectangle {
  x: number
  y: number
  height: number
  width: number

  constructor(canvas_height: number, x: number) {
    this.height = 100
    this.width = 20
    this.x = x
    this.y = canvas_height / 2 - this.height / 2
  }
  update(x: number, y: number, height: number, width: number): void {
    this.x = x
    this.y = y
    this.height = height
    this.width = width
  }
  draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = 'hsla(0, 0%, 100%, 1)'
    context.fillRect(this.x, this.y, this.width, this.height)
  }
}

interface Circle {
  x: number
  y: number
  radius: number
  direction: { x: number; y: number }
  speed: number
  updatePosition(delta: number): void
  draw(context: CanvasRenderingContext2D): void
}

class Ball implements Circle {
  x: number
  y: number
  radius: number

  constructor(x: number, y: number, radius: number) {
    this.x = x
    this.y = y
    this.radius = radius
  }
  update(x: number, y: number, radius: number): void {
    this.x = x
    this.y = y
    this.radius = radius
  }

  draw(context: CanvasRenderingContext2D): void {
    context.beginPath()
    context.fillStyle = 'hsla(0, 0%, 100%, 1)'
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    context.fill()
  }
}

export { type Rectangle, Paddle, type Circle, Ball }
