import { randomNumberBetween } from './helpers/geometry'

interface Rectangle {
  x: number
  y: number
  height: number
  width: number
  conv_rate: number
  update(paddleref: any): void
  draw(context: CanvasRenderingContext2D): void
}

class Paddle implements Rectangle {
  x: number
  y: number
  height: number
  width: number
  conv_rate: number
  constructor(paddleref: any, conv: number) {
    this.conv_rate=conv
    this.height = paddleref.height * this.conv_rate
    this.width = paddleref.width * this.conv_rate
    this.x = paddleref.x * this.conv_rate
    this.y = paddleref.y * this.conv_rate
  }
  update(paddleref: any): void {
    this.height = paddleref.height*this.conv_rate
    this.width = paddleref.width*this.conv_rate
    this.x = paddleref.x*this.conv_rate
    this.y = paddleref.y*this.conv_rate
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
  conv_rate: number
  update(ballref: any): void
  updateConvRate(conv_rate: number): void
  draw(context: CanvasRenderingContext2D): void
}

class Ball implements Circle {
  x: number
  y: number
  radius: number
  conv_rate: number
  constructor(ballref: any, conv_rate: number) {
    this.conv_rate=conv_rate
    this.x = ballref.x*conv_rate
    this.y = ballref.y*conv_rate
    this.radius = ballref.radius*conv_rate
  }
  update(ballref: any): void {
    this.x = ballref.x*this.conv_rate
    this.y = ballref.y*this.conv_rate
    this.radius = ballref.radius*this.conv_rate
  }
  updateConvRate(conv_rate: number): void 
  {
    this.conv_rate=conv_rate
  }

  draw(context: CanvasRenderingContext2D): void {
    context.beginPath()
    context.fillStyle = 'hsla(0, 0%, 100%, 1)'
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    context.fill()
  }
}

class Score {
  player1: number
  player2: number
  canvas_width: number
  canvas_height: number
  constructor(score_ref: any, canvas: any)
  {
    console.log("Canvas_width starts with "+canvas.width)
    this.player1 = score_ref.player1
    this.player2 = score_ref.player2
    this.canvas_width = canvas.width
    this.canvas_height = canvas.height
  }
  update(score_ref: any)
  {
    this.player1 = score_ref.player1
    this.player2 = score_ref.player2
  }
  draw(context: CanvasRenderingContext2D): void
  {
    let fontSize = this.canvas_height/10
    context.font = fontSize+"px Helvetica Neue";
    context.fillStyle = "white";
    let text = this.player1+"|"+this.player2
    console.log("TEXT IS: "+text)
    let text_width = context.measureText(text).width
    let x = (this.canvas_width-text_width)/2
    console.log("X is: "+x)
    context.fillText(text, (this.canvas_width-text_width)/2, fontSize);
  }
}


export { type Rectangle, Paddle, type Circle, Ball, Score }
