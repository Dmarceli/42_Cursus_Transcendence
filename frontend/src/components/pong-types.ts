const board_dims = {
  width: 1400,
  height: 700
}

interface Rectangle {
  x: number
  y: number
  height: number
  width: number
  conv_rate: number
  update(paddleref: any): void
  updateConvRate(conv_rate: number): void
  draw(context: CanvasRenderingContext2D): void
}

class Paddle implements Rectangle {
  x: number
  y: number
  height: number
  width: number
  nick: string
  conv_rate: number
  constructor(paddleref: any, conv: number) {
    this.conv_rate = conv
    this.height = paddleref.height * this.conv_rate
    this.width = paddleref.width * this.conv_rate
    this.x = paddleref.x * this.conv_rate
    this.y = paddleref.y * this.conv_rate
    this.nick = paddleref.nick
  }
  update(paddleref: any): void {
    this.height = paddleref.height * this.conv_rate
    this.width = paddleref.width * this.conv_rate
    this.x = paddleref.x * this.conv_rate
    this.y = paddleref.y * this.conv_rate
  }
  updateConvRate(conv_rate: number): void {
    this.conv_rate = conv_rate
  }
  draw(context: CanvasRenderingContext2D): void {
    this.drawRectangle(context)
    this.drawNick(context)
  }
  drawRectangle(context: CanvasRenderingContext2D)
  {
    const img = new Image();
  img.src = "brown_wood.jpg"
  context.drawImage(img, this.x, this.y, this.width, this.height)
  }
  drawNick(context: CanvasRenderingContext2D)
  {
    const board_height = board_dims.height * this.conv_rate
    let nick_size = board_height /20
    context.font = nick_size+"px Helvetica Neue";
    context.fillStyle = "white";
    const text_width = context.measureText(this.nick).width
    const x = this.x > board_height/2 ? this.x-text_width: this.x
    context.fillText(this.nick, x, nick_size+(board_height/30));
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
    this.conv_rate = conv_rate
    this.x = ballref.x * conv_rate
    this.y = ballref.y * conv_rate
    this.radius = ballref.radius * conv_rate
  }
  update(ballref: any): void {
    this.x = ballref.x * this.conv_rate
    this.y = ballref.y * this.conv_rate
    this.radius = ballref.radius * this.conv_rate
  }
  updateConvRate(conv_rate: number): void {
    this.conv_rate = conv_rate
  }

  draw(context: CanvasRenderingContext2D): void {
    context.beginPath()
    context.fillStyle = 'hsla(0, 0%, 100%, 1)'
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    context.fill()
  }
}

class Score {
  board_width: number
  board_height: number
  text: string
  fontSize: number

  constructor(score_ref: any, conv_rate: number) {
    this.board_width = board_dims.width * conv_rate
    this.board_height = board_dims.height * conv_rate
    this.fontSize = this.board_height/10
    this.text = score_ref.player1+"|"+score_ref.player2
  }
  update(score_ref: any) {
    this.text = score_ref.player1+"|"+score_ref.player2
  }
  update_dims(conv_rate: number): void {
    this.board_width = board_dims.width * conv_rate
    this.board_height = board_dims.height * conv_rate
    this.fontSize = this.board_height/10
  }
  draw(context: CanvasRenderingContext2D): void {
    context.font = this.fontSize + "px Helvetica Neue";
    context.fillStyle = "white";
    const text_width = context.measureText(this.text).width
    const x = (this.board_width - text_width) / 2
    context.fillText(this.text, x, this.fontSize);
  }
}

export { type Rectangle, Paddle, type Circle, Ball, Score }
