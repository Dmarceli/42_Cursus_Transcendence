import { Ball } from './Ball'
import { PlayerPaddle } from './PlayerPaddle'
import { Score } from './Score'
import { GameHistoryService } from 'src/db_interactions_modules/game_history/game_history.service'
import { User } from 'src/db_interactions_modules/users/user.entity'

const board_dims = {
  width: 1400,
  height: 700
}
function areColliding(circle: any, rectangle: any) {
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

export class Game {
  timeStart: Date
  ball: Ball
  playerPaddle1: PlayerPaddle
  playerPaddle2: PlayerPaddle
  score: Score
  isColliding: Boolean;
  gameHistoryService: GameHistoryService
  constructor(gameHistoryService: GameHistoryService) {
    this.timeStart = new Date()
    this.ball = new Ball(700, 350, 20)
    this.playerPaddle1 = new PlayerPaddle(40, 300, 20, 100)
    this.playerPaddle2 = new PlayerPaddle(1340, 300, 20, 100)
    this.score = new Score
    this.isColliding = false
    this.gameHistoryService = gameHistoryService
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

  update() {
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
    if (areColliding(this.ball.frontEndData, this.playerPaddle1.frontEndData) && !this.isColliding) {
      this.ball.updateAngle(this.playerPaddle1.frontEndData)
      if (this.ball.direction.x < 0 && this.ball.frontEndData.x > this.playerPaddle1.frontEndData.x + this.playerPaddle1.frontEndData.width
        || this.ball.direction.x > 0 && this.ball.frontEndData.x < this.playerPaddle1.frontEndData.x + this.playerPaddle1.frontEndData.width) {
        this.ball.direction.x *= -1
      }
      this.ball.speed *= 1.1
      this.isColliding = true
    }
    else if (areColliding(this.ball.frontEndData, this.playerPaddle2.frontEndData) && !this.isColliding) {
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
  checkStatus() {
    if (this.isGameFinished()) {
      this.handleFinishGame()
      return
    }
    this.handleGameContinue()
  }
  isGameFinished() {
    return (this.score.player1 > 4 || this.score.player2 > 4)
  }
  handleFinishGame() {
    if (this.score.player1 > 4) {
      this.finish(this.playerPaddle1, this.playerPaddle2)
      return
    }
    this.finish(this.playerPaddle2, this.playerPaddle1)
  }
  async finish(winner: PlayerPaddle, loser: PlayerPaddle) {
    console.log("WINNER "+winner.user)
    console.log("LOSER "+loser.user)
    let gameHistoryEntry = {
      winnerId: winner.user.id,
      loserId: loser.user.id,
      points: await this.calculateXP(winner.user, loser.user),
      time_begin: this.timeStart
    }
    await this.gameHistoryService.create(gameHistoryEntry)
    winner.client?.emit('PlayerWon')
    loser.client?.emit('PlayerLost')
    this.reset()
  }
  handleGameContinue() {
    let gamevisual = {
      ball: this.ball.frontEndData,
      playerPaddle1: this.playerPaddle1.frontEndData,
      playerPaddle2: this.playerPaddle2.frontEndData,
      score: this.score
    }
    this.playerPaddle1.client?.emit('updateGame', gamevisual)
    this.playerPaddle2.client?.emit('updateGame', gamevisual)
  }
  async calculateXP(winner: User, loser: User) {
    let winnerPoints = await this.gameHistoryService.sum_score(winner)
    let loserPoints = await this.gameHistoryService.sum_score(loser)
    let gameSeconds = this.getSeconds()
    if (winnerPoints == 0) {
      return gameSeconds * 5
    }
    return ((loserPoints/winnerPoints)+1) * gameSeconds
  }
  getSeconds(): number {
    const currentTime = new Date();
    const elapsedTimeInSeconds = Math.floor((currentTime.getTime() - this.timeStart.getTime()) / 1000);
    return elapsedTimeInSeconds;
  }
};
