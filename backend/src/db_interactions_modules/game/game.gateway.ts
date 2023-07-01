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

class Ball {
  x: number
  y: number
  radius: number
  direction: { x: number; y: number }
  speed: number

  constructor(initial_x: number, initial_y: number) {
    this.x = initial_x
    this.y = initial_y
    this.radius = initial_y / 20
    this.direction = { x: 0, y: 0 }
    while (Math.abs(this.direction.x) <= 0.4 || Math.abs(this.direction.x) >= 0.9) {
      const angle = randomNumberBetween(0, 2 * Math.PI)
      this.direction = { x: Math.cos(angle), y: Math.sin(angle) }
    }
    this.speed = 0.5
  }
  updatePosition(delta: number): void {
    this.x += this.direction.x * this.speed * delta
    this.y += this.direction.y * this.speed * delta
  }
}

function isBallInsideHorizontalWalls() {
    return game.ball.y + game.ball.radius < 1400 && game.ball.y - game.ball.radius > 0
}

function isBallInsideVerticalWalls() {
    return game.ball.x + game.ball.radius < 700 && game.ball.x - game.ball.radius > 0
}

class Paddle {
  x: number
  y: number
  height: number
  width: number
  movingDown: Boolean
  movingUp: Boolean

  constructor(canvas_height: number, x: number) {
    this.height = 100
    this.width = 20
    this.x = x
    this.y = canvas_height / 2 - this.height / 2
    this.movingDown = false
    this.movingUp = false
  }
  updatePosition(canvasmax: number): void {
    if (this.movingDown && this.y + this.height + 10 < canvasmax) {
      this.y += 10
    } else if (this.movingUp && this.y > 0) {
      this.y -= 10
    }
  }
  draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = 'hsla(0, 0%, 100%, 1)'
    context.fillRect(this.x, this.y, this.width, this.height)
  }
}

function randomNumberBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

let game: any = {
  ball: new Ball(200, 200),
  paddle1: new Paddle(500, 20),
  paddle2: new Paddle(500, 500)
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
 })
 export class GameGateway
 implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
 @WebSocketServer() server: Server;

 handleConnection(client: Socket, ...args: any[]) {
  console.log(`Connected ${client.id}`);
}
 
 handleDisconnect(client: Socket) {
   console.log(`Disconnected: ${client.id}`);
 }
 
 afterInit(server: Server) {
   
 }

// Game

 @SubscribeMessage('PlayerEntered')
 @UsePipes(new ValidationPipe())
 async PlayerEntered(client: Socket): Promise<void> {
  console.log("OH YEA")
  this.server.emit('updateGame', game);
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