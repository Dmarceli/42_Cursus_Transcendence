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
  collidingPaddle: boolean
  collidingWall: boolean
  constructor(x: number, y: number, radius: number) {
    this.visual = { x: x, y: y, radius: radius }
    this.visual.radius = y / 20
    this.direction = { x: 0, y: 0 }
    this.collidingPaddle=false
    this.collidingWall=false
    while (Math.abs(this.direction.x) <= 0.4 || Math.abs(this.direction.x) >= 0.9) {
      const angle = randomNumberBetween(0, 2 * Math.PI)
      this.direction = { x: Math.cos(angle), y: Math.sin(angle) }
    }
    this.speed = 10
  }
  updatePosition(): void {
    this.visual.x += this.direction.x * this.speed
    this.visual.y += this.direction.y * this.speed
  }
}

function isBallInsideHorizontalWalls() {
  return game.ball.visual.y + game.ball.visual.radius < board_dims.height && game.ball.visual.y - game.ball.visual.radius > 0
}

function isBallInsideVerticalWalls() {
  return game.ball.visual.x + game.ball.visual.radius < board_dims.width && game.ball.visual.x - game.ball.visual.radius > 0
}

class PlayerPaddle {
  visual: {
    x: number
    y: number
    height: number
    width: number
  }
  id: string
  movingDown: Boolean
  movingUp: Boolean
  constructor(x: number, y: number, width: number, height: number) {
    this.visual = {
      x: x,
      y: y,
      width: width,
      height: height,
    };
    this.movingDown = false
    this.movingUp = false
  }
  updatePosition(canvasmax: number): void {
    if (this.movingDown && this.visual.y + this.visual.height + 10 < canvasmax) {
      this.visual.y += 10
    } else if (this.movingUp && this.visual.y > 0) {
      this.visual.y -= 10
    }
  }
}

function randomNumberBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}
class Game {
  ball: Ball
  playerPaddle1: PlayerPaddle
  playerPaddle2: PlayerPaddle


};

let game: Game = {
  ball: new Ball(200, 200, 20),
  playerPaddle1: new PlayerPaddle(40, 300, 20, 100),
  playerPaddle2: new PlayerPaddle(1340, 300, 20, 100),
}

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
    console.log(`Connected ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);
  }

  afterInit(server: Server) {
    this.UpdateAllPositions();
  }

  // Game

  @SubscribeMessage('PlayerEntered')
  @UsePipes(new ValidationPipe())
  async PlayerEntered(client: Socket): Promise<void> {
    console.log("PlayerEntered")
    if (!game.playerPaddle1.id)
    {
      game.playerPaddle1.id=client.id
    } else if(!game.playerPaddle2.id)
    {
      game.playerPaddle2.id=client.id
    }
    this.server.emit('updateGame', game);
  }

  @SubscribeMessage('keydown')
  @UsePipes(new ValidationPipe())
  async PlayerKeyDown(client: Socket, key: string): Promise<void> {
    console.log("KEY Down" + client.id)
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
    console.log("KEY UPP" + client.id)
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
        playerPaddle1: game.playerPaddle1.visual,
        playerPaddle2: game.playerPaddle2.visual
      }
      // printAll()
      this.server.emit('updateGame', gamevisual)
    }, 200
    )
  }
}

function GameLogic()
{
  if (!isBallInsideVerticalWalls() && refreshIntervalid != null){
    clearInterval(refreshIntervalid)
  }

  game.playerPaddle1.updatePosition(board_dims.height);
  game.playerPaddle2.updatePosition(board_dims.height);
  BallPositionLogic();
  game.ball.updatePosition()
}

function BallPositionLogic()
{
  if (game.ball.collidingWall == false && !isBallInsideHorizontalWalls()) {
    game.ball.direction.y *= -1
    game.ball.collidingWall=true
  }
  else{
    game.ball.collidingWall = false
  }
  if (game.ball.collidingPaddle == false &&
    (areColliding(game.ball.visual, game.playerPaddle1.visual) || areColliding(game.ball.visual, game.playerPaddle2.visual))
  ) {
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

function printAll()
{
  console.log("Ball:")
  console.log("x:"+game.ball.visual.x)
  console.log("y:"+game.ball.visual.y)
  console.log("radius:"+game.ball.visual.radius)
  console.log("")
  console.log("Paddle 1:")
  console.log("id:" + game.playerPaddle1.id)
  console.log("x:" + game.playerPaddle1.visual.x)
  console.log("y:" + game.playerPaddle1.visual.y)
  console.log("width:" + game.playerPaddle1.visual.width)
  console.log("height:" + game.playerPaddle1.visual.height)
  console.log("")
  console.log("Player 2:" + game.playerPaddle2.id)
  console.log("id:" + game.playerPaddle2.id)
  console.log("x:" + game.playerPaddle2.visual.x)
  console.log("y:" + game.playerPaddle2.visual.y)
  console.log("width:" + game.playerPaddle2.visual.width)
  console.log("height:" + game.playerPaddle2.visual.height)
}
