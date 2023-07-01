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
    this.visual = { x: x, y: y, radius: radius }
    this.visual.radius = y / 20
    this.direction = { x: 0, y: 0 }
    while (Math.abs(this.direction.x) <= 0.4 || Math.abs(this.direction.x) >= 0.9) {
      const angle = randomNumberBetween(0, 2 * Math.PI)
      this.direction = { x: Math.cos(angle), y: Math.sin(angle) }
    }
    this.speed = 0.5
  }
  updatePosition(delta: number): void {
    this.visual.x += this.direction.x * this.speed * delta
    this.visual.y += this.direction.y * this.speed * delta
  }
}

function isBallInsideHorizontalWalls() {
  return game.ball.visual.y + game.ball.visual.radius < board_dims.width && game.ball.visual.y - game.ball.visual.radius > 0
}

function isBallInsideVerticalWalls() {
  return game.ball.visual.x + game.ball.visual.radius < board_dims.height && game.ball.visual.x - game.ball.visual.radius > 0
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
  constructor(canvas_height: number, x: number) {
    this.visual = {
      x: x,
      height: 100,
      width: 20,
      y: canvas_height / 2 - 100 / 2,
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
  lastPaddleCollisionTime: number
  lastWallCollisionTime: number
};

let game: Game = {
  ball: new Ball(200, 200, 20),
  playerPaddle1: new PlayerPaddle(500, 20),
  playerPaddle2: new PlayerPaddle(500, 500),
  lastPaddleCollisionTime: 0,
  lastWallCollisionTime: 0
}

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
    console.log("WANNA PLAY A GAME")
    game.playerPaddle1.id=client.id
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
    setInterval(() => {
      GameLogic();
      let gamevisual = {
        ball: game.ball.visual,
        playerPaddle1: game.playerPaddle1.visual,
        playerPaddle2: game.playerPaddle2.visual
      }
      console.log("Updating Game with players")
      console.log("Player 1:" + game.playerPaddle1.id)
      console.log("Player 2:" + game.playerPaddle2.id)
      this.server.emit('updateGame', gamevisual)
    }, 15
    )
  }
}

function GameLogic()
{
  game.playerPaddle1.updatePosition(board_dims.height);
  game.playerPaddle2.updatePosition(board_dims.height);
  PaddlePositionLogic();
  BallPositionLogic();
}

function PaddlePositionLogic()
{
}

function BallPositionLogic()
{
  if (Date.now() > game.lastWallCollisionTime + 300 && !isBallInsideHorizontalWalls()) {
    game.ball.direction.y *= -1
    game.lastWallCollisionTime = Date.now()
  }
  if (
    Date.now() > game.lastPaddleCollisionTime + 300 &&
    (areColliding(game.ball, game.playerPaddle1) || areColliding(game.ball, game.playerPaddle2))
  ) {
    game.ball.direction.x *= -1
    game.ball.speed *= 1.1
    game.lastPaddleCollisionTime = Date.now()
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

// if (gamecanvas.value != null) {
//   gamecanvas.value.height = window.innerHeight * 0.8
//   gamecanvas.value.width = window.innerWidth * 0.8
//   ctx.value = gamecanvas.value.getContext('2d')
//   ball = new Ball(gamecanvas.value)
//   paddle1 = new Paddle(gamecanvas.value, 20)
//   paddle2 = new Paddle(gamecanvas.value, gamecanvas.value.width - paddle1.x - paddle1.width)
// }
// }

// if (Date.now() > lastWallCollisionTime + 300 && !isBallInsideHorizontalWalls()) {
//   ball.direction.y *= -1
//   lastWallCollisionTime = Date.now()
// }
// if (
//   Date.now() > lastPaddleCollisionTime + 300 &&
//   (areColliding(ball, paddle1) || areColliding(ball, paddle2))
// ) {
//   ball.direction.x *= -1
//   ball.speed *= 1.1
//   lastPaddleCollisionTime = Date.now()
// }

// if (this.movingDown && this.y + this.height + 10 < canvasmax) {
//   this.y += 10
// } else if (this.movingUp && this.y > 0) {
//   this.y -= 10
// }


// function onKeyDown(event: KeyboardEvent) {
//   if (paddle1 != null) {
//     console.log(event.key)
//     const handlers: any = {
//       ArrowUp: () => {
//         paddle2 != null && (paddle2.movingUp = true)
//       },
//       ArrowDown: () => {
//         paddle2 != null && (paddle2.movingDown = true)
//       },
//       w: () => {
//         paddle1 != null && (paddle1.movingUp = true)
//       },
//       s: () => {
//         paddle1 != null && (paddle1.movingDown = true)
//       }
//     }[event.key]
//     handlers?.()
//   }
// }

// function onKeyUp(event: KeyboardEvent) {
//   const handlers: any = {
//     ArrowUp: () => {
//       paddle2 != null && (paddle2.movingUp = false)
//     },
//     ArrowDown: () => {
//       paddle2 != null && (paddle2.movingDown = false)
//     },
//     w: () => {
//       paddle1 != null && (paddle1.movingUp = false)
//     },
//     s: () => {
//       paddle1 != null && (paddle1.movingDown = false)
//     }
//   }[event.key]
//   handlers?.()
// }