import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';
import { UsePipes, ValidationPipe } from '@nestjs/common';

const board_dims = {
  width: 1400,
  height: 700
}

class Ball {
  visual: {
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
    this.visual.x += this.direction.x * this.speed
    this.visual.y += this.direction.y * this.speed
  }
  init(x: number, y: number, radius: number): void {
    this.visual = { x: x, y: y, radius: radius }
    this.visual.radius = y / 40
    this.direction = { x: 0, y: 0 }
    while (Math.abs(this.direction.x) <= 0.4 || Math.abs(this.direction.x) >= 0.9) {
      const angle = randomNumberBetween(0, 2 * Math.PI)
      this.direction = { x: Math.cos(angle), y: Math.sin(angle) }
    }
    this.speed = 5
  }
}

function isBallTouchingTopWall() {
  return game.ball.visual.y - game.ball.visual.radius < 0
}

function isBallTouchingBottomWall() {
  return game.ball.visual.y + game.ball.visual.radius > board_dims.height
}

function ballTouchingLeftWall() {
  return game.ball.visual.x - game.ball.visual.radius < 0
}

function ballTouchingRightWall() {
  return game.ball.visual.x + game.ball.visual.radius > board_dims.width
}

class PlayerPaddle {
  frontEndData: {
    x: number
    y: number
    height: number
    width: number
  }
  id: string
  movingDown: Boolean
  movingUp: Boolean
  constructor(x: number, y: number, width: number, height: number) {
    this.init(x, y, width, height)
  }
  updatePosition(canvasHeight: number): void {
    if (this.movingDown && this.frontEndData.y + this.frontEndData.height + 10 < canvasHeight) {
      this.frontEndData.y += 10
    } else if (this.movingUp && this.frontEndData.y > 0) {
      this.frontEndData.y -= 10
    }
  }
  init(x: number, y: number, width: number, height: number): void {
    this.frontEndData = {
      x: x,
      y: y,
      width: width,
      height: height,
    };
    this.movingDown = false
    this.movingUp = false
  }
}

class Score {
  player1: number
  player2: number
  constructor() {
    this.player1 = 0
    this.player2 = 0
  }
}

function randomNumberBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}
class Game {
  ball: Ball
  playerPaddle1: PlayerPaddle
  playerPaddle2: PlayerPaddle
  score: Score
  constructor() {
    this.ball = new Ball(700, 350, 20)
    this.playerPaddle1 = new PlayerPaddle(40, 300, 20, 100)
    this.playerPaddle2 = new PlayerPaddle(1340, 300, 20, 100)
    this.score = new Score
  }
  resetPositions(): void {
    this.ball.init(700, 350, 20)
    this.playerPaddle1.init(40, 300, 20, 100)
    this.playerPaddle2.init(1340, 300, 20, 100)
  }

};

let games = []

let game = new Game

let refreshIntervalid = null

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Game gateway detected new client: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Game detected disconnection of client: ${client.id}`);
  }

  afterInit(server: Server) {
  }

  // Game

  @SubscribeMessage('NewPlayer')
  @UsePipes(new ValidationPipe())
  async NewPlayer(client: Socket): Promise<void> {
    console.log("NewPlayer")
    // TODO: Replace with intraId
    let Game = AddPlayerToLobby(client.id)
    if (Game == null)
    {
      this.server.emit('WaitingForPlayers', game);
    }
    else {
      this.UpdateAllPositions();
      if (!game.playerPaddle1.id) {
        game.playerPaddle1.id = client.id
      } else if (!game.playerPaddle2.id) {
        game.playerPaddle2.id = client.id
      }
      this.server.emit('updateGame', game);
    }
  }

  @SubscribeMessage('PlayerExited')
  @UsePipes(new ValidationPipe())
  async PlayerExited(client: Socket): Promise<void> {
    console.log("PlayerExited")
    if (game.playerPaddle1.id == client.id) {
      game.playerPaddle1.id = null
    } else if (game.playerPaddle2.id == client.id) {
      game.playerPaddle2.id = null
    }
    this.server.emit('updateGame', game);
  }

  @SubscribeMessage('keydown')
  @UsePipes(new ValidationPipe())
  async PlayerKeyDown(client: Socket, key: string): Promise<void> {
    // console.log("KEY Down" + client.id)
    if (game.playerPaddle1.id === client.id) {
      if (key === "up") {
        game.playerPaddle1.movingUp = true
      }
      else if (key === "down") {
        game.playerPaddle1.movingDown = true
      }
    } else if (game.playerPaddle2.id === client.id) {
      if (key === "up") {
        game.playerPaddle2.movingUp = true
      }
      else if (key === "down") {
        game.playerPaddle2.movingDown = true
      }
    }
  }

  @SubscribeMessage('keyup')
  @UsePipes(new ValidationPipe())
  async PlayerKeyUp(client: Socket, key: string): Promise<void> {
    // console.log("KEY UP" + client.id)
    if (game.playerPaddle1.id === client.id) {
      if (key === "up") {
        game.playerPaddle1.movingUp = false
      }
      else if (key === "down") {
        game.playerPaddle1.movingDown = false
      }
    } else if (game.playerPaddle2.id === client.id) {
      if (key === "up") {
        game.playerPaddle2.movingUp = false
      }
      else if (key === "down") {
        game.playerPaddle2.movingDown = false
      }
    }
  }

  @UsePipes(new ValidationPipe())
  async UpdateAllPositions(): Promise<void> {
    refreshIntervalid = setInterval(() => {
      GameLogic();
      let gamevisual = {
        ball: game.ball.visual,
        playerPaddle1: game.playerPaddle1.frontEndData,
        playerPaddle2: game.playerPaddle2.frontEndData,
        score: game.score
      }
      // printAll()
      this.server.emit('updateGame', gamevisual)
    }, 15
    )
  }
}

function AddPlayerToLobby(playerId: string) {
  if (!games.length) {
    let game = new Game
    game.playerPaddle1.id = playerId
    games.push(game)
    return null
  }
  for (let i = 0; i < games.length; i++) {
    if (games[i].playerPaddle1.id && !games[i].playerPaddle2.id)
    {
      games[i].playerPaddle2.id = playerId
      return (i)
    }
    else if (!games[i].playerPaddle1.id && games[i].playerPaddle2.id)
    {
      games[i].playerPaddle2.id = playerId
      return (i)
    }
    else
    {
      return null
    }
  }
}

function GameLogic() {
  ScoreLogic()
  game.playerPaddle1.updatePosition(board_dims.height);
  game.playerPaddle2.updatePosition(board_dims.height);
  BallPositionLogic();
  game.ball.updatePosition()
}

function ScoreLogic() {
  if (ballTouchingLeftWall()) {
    game.score.player2 += 1
    game.resetPositions()
  } else if (ballTouchingRightWall()) {
    game.score.player1 += 1
    game.resetPositions()
  }
  if ((game.score.player1 > 4 || game.score.player2 > 4) && refreshIntervalid != null) {
    clearInterval(refreshIntervalid)
  }
}

function BallPositionLogic() {
  if (isBallTouchingTopWall() && game.ball.direction.y < 0) {
    game.ball.direction.y *= -1
  }
  else if (isBallTouchingBottomWall() && game.ball.direction.y > 0) {
    game.ball.direction.y *= -1
  }
  if (areColliding(game.ball.visual, game.playerPaddle1.frontEndData) && game.ball.direction.x < 0) {
    game.ball.direction.x *= -1
    game.ball.speed *= 1.1
  }
  else if (areColliding(game.ball.visual, game.playerPaddle2.frontEndData) && game.ball.direction.x > 0) {
    game.ball.direction.x *= -1
    game.ball.speed *= 1.1
  }
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

function printAll() {
  console.log("Ball:")
  console.log("x:" + game.ball.visual.x)
  console.log("y:" + game.ball.visual.y)
  console.log("radius:" + game.ball.visual.radius)
  console.log("")
  console.log("Paddle 1:")
  console.log("id:" + game.playerPaddle1.id)
  console.log("x:" + game.playerPaddle1.frontEndData.x)
  console.log("y:" + game.playerPaddle1.frontEndData.y)
  console.log("width:" + game.playerPaddle1.frontEndData.width)
  console.log("height:" + game.playerPaddle1.frontEndData.height)
  console.log("")
  console.log("Player 2:" + game.playerPaddle2.id)
  console.log("id:" + game.playerPaddle2.id)
  console.log("x:" + game.playerPaddle2.frontEndData.x)
  console.log("y:" + game.playerPaddle2.frontEndData.y)
  console.log("width:" + game.playerPaddle2.frontEndData.width)
  console.log("height:" + game.playerPaddle2.frontEndData.height)
}
