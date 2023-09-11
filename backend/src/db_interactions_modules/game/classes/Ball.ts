function randomNumberBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export class Ball {
  frontEndData: {
    x: number
    y: number
    radius: number
  }
  direction: { x: number; y: number }
  speed: number
  constructor(x: number, y: number, radius: number) {
    this.init(x, y, radius)
  }
  updatePosition(): void {
    this.frontEndData.x += this.direction.x * this.speed
    this.frontEndData.y += this.direction.y * this.speed
  }
  updateAngle(paddle: any): void {
    let halfPaddleSize = paddle.height / 2
    let paddleMid = paddle.y + halfPaddleSize
    let collidePoint = this.frontEndData.y - paddleMid
    let angleRad = (collidePoint / halfPaddleSize) * Math.PI / 4
    this.direction.x = Math.cos(angleRad)
    this.direction.y = Math.sin(angleRad)
  }
  init(x: number, y: number, radius: number): void {
    this.frontEndData = { x: x, y: y, radius: radius }
    this.direction = { x: 0, y: 0 }
    while (Math.abs(this.direction.x) <= 0.4 || Math.abs(this.direction.x) >= 0.9) {
      const angle = randomNumberBetween(0, 2 * Math.PI)
      this.direction = { x: Math.cos(angle), y: Math.sin(angle) }
    }
    this.speed = 4
  }
  increaseBallSpeed() {
    if (this.speed < 11) {
      this.speed += 1.2
    }
  }
}
