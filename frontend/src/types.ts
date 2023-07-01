import { randomNumberBetween } from './helpers/geometry'

interface Rectangle {
  x: number
  y: number
  height: number
  width: number
  update(paddleref: any): void
  draw(context: CanvasRenderingContext2D): void
}

class Paddle implements Rectangle {
  x: number
  y: number
  height: number
  width: number

  constructor(paddleref: any) {
    this.height = paddleref.height
    this.width = paddleref.width
    this.x = paddleref.x
    this.y = paddleref.y
  }
  update(paddleref: any): void {
    this.height = paddleref.height
    this.width = paddleref.width
    this.x = paddleref.x
    this.y = paddleref.y
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
  update(ballref: any): void
  draw(context: CanvasRenderingContext2D): void
}

class Ball implements Circle {
  x: number
  y: number
  radius: number
  constructor(ballref: any) {
    this.x = ballref.x
    this.y = ballref.y
    this.radius = ballref.radius
  }
  update(ballref: any): void {
    this.x = ballref.x
    this.y = ballref.y
    this.radius = ballref.radius
  }

  draw(context: CanvasRenderingContext2D): void {
    context.beginPath()
    context.fillStyle = 'hsla(0, 0%, 100%, 1)'
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    context.fill()
  }
}

export { type Rectangle, Paddle, type Circle, Ball }
