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
  init(x: number, y: number, radius: number): void {
    this.frontEndData = { x: x, y: y, radius: radius }
    this.frontEndData.radius = y / 40
    this.direction = { x: 0, y: 0 }
    while (Math.abs(this.direction.x) <= 0.4 || Math.abs(this.direction.x) >= 0.9) {
      const angle = randomNumberBetween(0, 2 * Math.PI)
      this.direction = { x: Math.cos(angle), y: Math.sin(angle) }
    }
    this.speed = 5
  }
}

function isBallTouchingTopWall(game) {
  return game.ball.frontEndData.y - game.ball.frontEndData.radius < 0
}

function isBallTouchingBottomWall(game) {
  return game.ball.frontEndData.y + game.ball.frontEndData.radius > board_dims.height
}

function ballTouchingLeftWall(game) {
  return game.ball.frontEndData.x - game.ball.frontEndData.radius < 0
}

function ballTouchingRightWall(game) {
  return game.ball.frontEndData.x + game.ball.frontEndData.radius > board_dims.width
}

class PlayerPaddle {
  frontEndData: {
    x: number
    y: number
    height: number
    width: number
  }
  client: Socket | null
  movingDown: Boolean
  movingUp: Boolean
  constructor(x: number, y: number, width: number, height: number) {
    this.init(x, y, width, height)
    this.client = null
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
    let LobbyPlayer = null
    for (let game of games) {
      if (game.playerPaddle1.client && game.playerPaddle1.client.id == client.id) {
        game.playerPaddle2.client.emit("PlayerWon")
      } else if (game.playerPaddle2.client && game.playerPaddle2.client.id == client.id) {
        game.playerPaddle1.client.emit("PlayerWon")
      }
    }
    if (client != null)
      games = games.filter(RemoveGameWithClient(client))
  }

  afterInit(server: Server) {
    this.UpdateAllPositions();
    // Logic should be here
  }

  // Game
  @SubscribeMessage('NewPlayer')
  @UsePipes(new ValidationPipe())
  async NewPlayer(client: Socket): Promise<void> {
    console.log("NewPlayer"+client.id)
    // TODO: Replace with intraId
    AddPlayerToGame(client)
  }

  @SubscribeMessage('PlayerExited')
  @UsePipes(new ValidationPipe())
  async PlayerExited(client: Socket): Promise<void> {
    console.log("PlayerExited")
  }

  @SubscribeMessage('keydown')
  @UsePipes(new ValidationPipe())
  async PlayerKeyDown(client: Socket, key: string): Promise<void> {
    for (let game of games) {
      if (game.playerPaddle1.client.id === client.id) {
        if (key === "up") {
          game.playerPaddle1.movingUp = true
        }
        else if (key === "down") {
          game.playerPaddle1.movingDown = true
        }
      } else if (game.playerPaddle2.client.id === client.id) {
        if (key === "up") {
          game.playerPaddle2.movingUp = true
        }
        else if (key === "down") {
          game.playerPaddle2.movingDown = true
        }
      }
    }
  }

  @SubscribeMessage('keyup')
  @UsePipes(new ValidationPipe())
  async PlayerKeyUp(client: Socket, key: string): Promise<void> {
    // console.log("KEY UP" + client.id)
    for (let game of games) {

      if (game.playerPaddle1.client.id === client.id) {
        if (key === "up") {
          game.playerPaddle1.movingUp = false
        }
        else if (key === "down") {
          game.playerPaddle1.movingDown = false
        }
      } else if (game.playerPaddle2.client.id === client.id) {
        if (key === "up") {
          game.playerPaddle2.movingUp = false
        }
        else if (key === "down") {
          game.playerPaddle2.movingDown = false
        }
      }
    }
  }

  @UsePipes(new ValidationPipe())
  async UpdateAllPositions(): Promise<void> {
    setInterval(() => {
      summary()
      for (let game of games) {
        if (game.playerPaddle1.client !== null && game.playerPaddle2.client !== null)
        {
          UpdateGame(game);
          if ((game.score.player1 > 4 || game.score.player2 > 4)) {
            if (game.score.player1 > 4)
            {
              game.playerPaddle1.client?.emit('PlayerWon')
              game.playerPaddle2.client?.emit('PlayerLost')
            }
            else if (game.score.player2 > 4)
            {
              game.playerPaddle2.client?.emit('PlayerWon')
              game.playerPaddle1.client?.emit('PlayerLost')
            }
          }
          else
          {
            let gamevisual = {
              ball: game.ball.frontEndData,
              playerPaddle1: game.playerPaddle1.frontEndData,
              playerPaddle2: game.playerPaddle2.frontEndData,
              score: game.score
            }
            // console.log("Updating game for client"+game.playerPaddle1.client?.id)
            // console.log("Updating game for client"+game.playerPaddle2.client?.id)
            game.playerPaddle1.client?.emit('updateGame', gamevisual)
            game.playerPaddle2.client?.emit('updateGame', gamevisual)
          }
          // printAll(game)
        }
        else
        {
          console.log("Updating game for client"+game.playerPaddle1.client?.id)
          console.log("Updating game for client"+game.playerPaddle2.client?.id)
          game.playerPaddle1.client?.emit('WaitingForPlayers')
          game.playerPaddle2.client?.emit('WaitingForPlayers')
        }
      }
    },15

    )
  }
}

function AddPlayerToGame(playerClient: Socket) {
  if (!games.length) {
    let game = new Game
    game.playerPaddle1.client = playerClient
    games.push(game)
    return
  }
  for (let i = 0; i < games.length; i++) {
    if (games[i].playerPaddle1.client && !games[i].playerPaddle2.client) {
      games[i].playerPaddle2.client = playerClient
      return
    }
    else if (!games[i].playerPaddle1.client && games[i].playerPaddle2.client) {
      games[i].playerPaddle2.client = playerClient
      return
    }
  }
}

function RemoveGameWithClient(client) {
    return function(game) {
        return game.playerPaddle1.client.id != client.id && game.playerPaddle2.client.id != client.id;
    }
}

function UpdateGame(game) {
  game.playerPaddle1.updatePosition(board_dims.height);
  game.playerPaddle2.updatePosition(board_dims.height);
  BallPositionLogic(game);
  game.ball.updatePosition()
  ScoreLogic(game)
}

function ScoreLogic(game) {
  if (ballTouchingLeftWall(game)) {
    game.score.player2 += 1
    game.resetPositions()
  } else if (ballTouchingRightWall(game)) {
    game.score.player1 += 1
    game.resetPositions()
  }
}

function BallPositionLogic(game) {
  if (isBallTouchingTopWall(game) && game.ball.direction.y < 0) {
    game.ball.direction.y *= -1
  }
  else if (isBallTouchingBottomWall(game) && game.ball.direction.y > 0) {
    game.ball.direction.y *= -1
  }
  if (areColliding(game.ball.frontEndData, game.playerPaddle1.frontEndData) && game.ball.direction.x < 0) {
    game.ball.direction.x *= -1
    game.ball.speed *= 1.1
  }
  else if (areColliding(game.ball.frontEndData, game.playerPaddle2.frontEndData) && game.ball.direction.x > 0) {
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

function printAll(game) {
  console.log("Ball:")
  console.log("x:" + game.ball.frontEndData.x)
  console.log("y:" + game.ball.frontEndData.y)
  console.log("radius:" + game.ball.frontEndData.radius)
  console.log("")
  console.log("Paddle 1:")
  console.log("id:" + game.playerPaddle1.client.id)
  console.log("x:" + game.playerPaddle1.frontEndData.x)
  console.log("y:" + game.playerPaddle1.frontEndData.y)
  console.log("width:" + game.playerPaddle1.frontEndData.width)
  console.log("height:" + game.playerPaddle1.frontEndData.height)
  console.log("")
  console.log("Player 2:" + game.playerPaddle2.client.id)
  console.log("id:" + game.playerPaddle2.client.id)
  console.log("x:" + game.playerPaddle2.frontEndData.x)
  console.log("y:" + game.playerPaddle2.frontEndData.y)
  console.log("width:" + game.playerPaddle2.frontEndData.width)
  console.log("height:" + game.playerPaddle2.frontEndData.height)
}

function summary()
{
  console.log("THERE ARE "+games.length+" games")
}
