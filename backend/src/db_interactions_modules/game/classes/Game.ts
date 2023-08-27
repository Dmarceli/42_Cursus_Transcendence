import { Ball } from './Ball'
import { PlayerPaddle } from './PlayerPaddle'
import { Score } from './Score'
import { GameHistoryService } from 'src/db_interactions_modules/game_history/game_history.service'
import { User } from 'src/db_interactions_modules/users/user.entity'
import { Repository } from 'typeorm'
import { State } from './game-state-enum'

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
  startCounter: number
  starting: Boolean
  timeStart: Date | null
  ball: Ball
  playerPaddle1: PlayerPaddle
  playerPaddle2: PlayerPaddle
  score: Score
  isColliding: Boolean;
  isFinished: Boolean

  gameHistoryService: GameHistoryService
  userRepository: Repository<User>
  constructor(player1:PlayerPaddle, player2: PlayerPaddle, gameHistoryService: GameHistoryService, userRepository: Repository<User>) {
    this.timeStart = null
    this.starting = false
    this.startCounter = 3
    this.ball = new Ball(700, 350, 20)
    player1.setInitialPosition(40, 300)
    player2.setInitialPosition(1340, 300)
    this.playerPaddle1 = player1
    this.playerPaddle2 = player2
    this.score = new Score
    this.isColliding = false
    this.gameHistoryService = gameHistoryService
    this.userRepository = userRepository
    this.isFinished = false
  }
  start(player_states): void {
    let interval = setInterval(() => {
      if (this.startCounter < 1) {
        clearInterval(interval);
        this.timeStart = new Date()
        this.starting = false
        player_states.set(this.playerPaddle1.user.intra_nick, State.PLAYING)
        player_states.set(this.playerPaddle2.user.intra_nick, State.PLAYING)
      }
      if (player_states.has(this.playerPaddle1.user.intra_nick) && player_states.get(this.playerPaddle1.user.intra_nick) != State.STARTING)
        player_states.set(this.playerPaddle1.user.intra_nick, State.STARTING)
      if (player_states.has(this.playerPaddle2.user.intra_nick) && player_states.get(this.playerPaddle2.user.intra_nick) != State.STARTING)
        player_states.set(this.playerPaddle2.user.intra_nick, State.STARTING)
      this.playerPaddle1.client.emit("Starting", this.startCounter)
      this.playerPaddle2.client.emit("Starting", this.startCounter)
      this.startCounter--;
    }, 1000);
  }
  resetPositions(): void {
    this.ball.init(700, 350, 20)
    this.playerPaddle1.resetPositions(40, 300, 20, 100)
    this.playerPaddle2.resetPositions(1340, 300, 20, 100)
    this.isColliding = false
  }
  reset(): void {
    this.isFinished = true
    this.playerPaddle1.client = null
    this.playerPaddle1.user = null
    this.playerPaddle2.client = null
    this.playerPaddle2.user = null
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
  async checkStatus(player_states) {
    if (this.isGameFinished()) {
      await this.handleFinishGame()
      this.isFinished = true
      player_states.delete(this.playerPaddle1.user.intra_nick)
      player_states.delete(this.playerPaddle2.user.intra_nick)
    }
    this.handleGameContinue()
  }
  isGameFinished() {
    return (this.score.player1 > 4 || this.score.player2 > 4)
  }
  async handleFinishGame() {
    let winningPlayer = this.score.player1 > this.score.player2 ? this.playerPaddle1 : this.playerPaddle2;
    let losingPlayer = winningPlayer == this.playerPaddle1 ? this.playerPaddle2 : this.playerPaddle1;
    let losingScore = this.score.player1 < this.score.player2 ? this.score.player1 : this.score.player2
    this.finish(winningPlayer, losingPlayer, losingScore)
  }
  async finish(winner: PlayerPaddle, loser: PlayerPaddle, loserScore: number) {
    winner.client?.emit('PlayerWon')
    loser.client?.emit('PlayerLost')
    let gameHistoryEntry = {
      winnerId: winner.user.id,
      loserId: loser.user.id,
      points: loserScore,
      time_begin: this.timeStart
    }
    this.reset()
    await this.gameHistoryService.create(gameHistoryEntry)
    const loserUser = await this.handleLoser(loser.frontEndData.nick)
    await this.handleWinner(winner.frontEndData.nick, loserUser)
    this.timeStart = null
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
    let winnerPoints = winner.xp_total
    let loserPoints = loser.xp_total
    let gameSeconds = this.getSeconds()
    if (winnerPoints == 0) {
      return gameSeconds * 5
    }
    return Math.round(((loserPoints / winnerPoints) + 1) * gameSeconds)
  }
  getSeconds(): number {
    const currentTime = new Date();
    const elapsedTimeInSeconds = Math.floor((currentTime.getTime() - this.timeStart.getTime()) / 1000);
    return elapsedTimeInSeconds;
  }
  async handleLoser(loserNick: string) {
    let loserUser = await this.userRepository.findOne({ where: { intra_nick: loserNick } })
    loserUser.lost_games++
    return await this.userRepository.save(loserUser);
  }
  async handleWinner(winnerNick: string, loserUser: User) {
    const winnerUser = await this.userRepository.findOne({ where: { intra_nick: winnerNick } })
    winnerUser.won_games++
    winnerUser.xp_total += await this.calculateXP(winnerUser, loserUser)
    return await this.userRepository.save(winnerUser);
  }
};
