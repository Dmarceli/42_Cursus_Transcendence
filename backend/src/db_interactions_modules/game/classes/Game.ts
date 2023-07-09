import { Ball } from './Ball'
import { PlayerPaddle } from './PlayerPaddle'
import { Score } from './Score'

const board_dims = {
  width: 1400,
  height: 700
}

export class Game {
  ball: Ball
  playerPaddle1: PlayerPaddle
  playerPaddle2: PlayerPaddle
  score: Score
  isColliding: Boolean;
  constructor() {
    this.ball = new Ball(700, 350, 20)
    this.playerPaddle1 = new PlayerPaddle(40, 300, 20, 100)
    this.playerPaddle2 = new PlayerPaddle(1340, 300, 20, 100)
    this.score = new Score
    this.isColliding = false
  }
  resetPositions(): void {
    this.ball.init(700, 350, 20)
    this.playerPaddle1.init(40, 300, 20, 100)
    this.playerPaddle2.init(1340, 300, 20, 100)
    this.isColliding = false
  }
  reset(): void {
    this.ball = new Ball(700, 350, 20)
    this.playerPaddle1 = new PlayerPaddle(40, 300, 20, 100)
    this.playerPaddle2 = new PlayerPaddle(1340, 300, 20, 100)
    this.score = new Score
    this.isColliding = false
  }

  isBallTouchingTopWall() {
    return this.ball.frontEndData.y - this.ball.frontEndData.radius < 0
  }

  isBallTouchingBottomWall(this) {
    return this.ball.frontEndData.y + this.ball.frontEndData.radius > board_dims.height
  }

  ballTouchingLeftWall(this) {
    return this.ball.frontEndData.x - this.ball.frontEndData.radius < 0
  }

  ballTouchingRightWall(this) {
    return this.ball.frontEndData.x + this.ball.frontEndData.radius > board_dims.width
  }

  Update() {
    this.playerPaddle1.updatePosition(board_dims.height);
    this.playerPaddle2.updatePosition(board_dims.height);
    this.UpdateBallPosition();
    this.UpdateScore()
  }
  UpdateScore() {
    if (this.ballTouchingLeftWall()) {
      this.score.player2 += 1
      this.resetPositions()
    } else if (this.ballTouchingRightWall()) {
      this.score.player1 += 1
      this.resetPositions()
    }
  }

  UpdateBallPosition() {
    if (this.isBallTouchingTopWall() && this.ball.direction.y < 0) {
      this.ball.direction.y *= -1
    }
    else if (this.isBallTouchingBottomWall() && this.ball.direction.y > 0) {
      this.ball.direction.y *= -1
    }
    if (this.areColliding(this.ball.frontEndData, this.playerPaddle1.frontEndData) && !this.isColliding) {
      this.ball.updateAngle(this.playerPaddle1.frontEndData)
      if (this.ball.direction.x < 0 && this.ball.frontEndData.x > this.playerPaddle1.frontEndData.x + this.playerPaddle1.frontEndData.width
        || this.ball.direction.x > 0 && this.ball.frontEndData.x < this.playerPaddle1.frontEndData.x + this.playerPaddle1.frontEndData.width) {
        this.ball.direction.x *= -1
      }
      this.ball.speed *= 1.1
      this.isColliding = true
    }
    else if (this.areColliding(this.ball.frontEndData, this.playerPaddle2.frontEndData) && !this.isColliding) {
      this.ball.updateAngle(this.playerPaddle2.frontEndData)
      if (this.ball.direction.x > 0 && this.ball.frontEndData.x < this.playerPaddle2.frontEndData.x ||
        this.ball.direction.x < 0 && this.ball.frontEndData.x > this.playerPaddle2.frontEndData.x) {
        this.ball.direction.x *= -1
      }
      this.ball.speed *= 1.1
      this.isColliding = true
    }
    else {
      this.isColliding = false
    }
    this.ball.updatePosition()
  }
  areColliding(circle: any, rectangle: any) {
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
  print() {
    console.log("Ball:")
    console.log("x:" + this.ball.frontEndData.x)
    console.log("y:" + this.ball.frontEndData.y)
    console.log("radius:" + this.ball.frontEndData.radius)
    console.log("")
    console.log("Paddle 1:")
    console.log("id:" + this.playerPaddle1.client.id)
    console.log("x:" + this.playerPaddle1.frontEndData.x)
    console.log("y:" + this.playerPaddle1.frontEndData.y)
    console.log("width:" + this.playerPaddle1.frontEndData.width)
    console.log("height:" + this.playerPaddle1.frontEndData.height)
    console.log("")
    console.log("Player 2:" + this.playerPaddle2.client.id)
    console.log("id:" + this.playerPaddle2.client.id)
    console.log("x:" + this.playerPaddle2.frontEndData.x)
    console.log("y:" + this.playerPaddle2.frontEndData.y)
    console.log("width:" + this.playerPaddle2.frontEndData.width)
    console.log("height:" + this.playerPaddle2.frontEndData.height)
  }
};