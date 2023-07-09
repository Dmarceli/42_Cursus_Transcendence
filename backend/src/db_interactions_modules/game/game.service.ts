import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Game } from './classes/Game'

@Injectable()
export class GameService {
    constructor() { }
    games: Game[] = []
    // TODO: Replace with intraId
    AddPlayerToGame(playerClient: Socket) {
        console.log("NewPlayer " + playerClient)
        for (let i = 0; i < this.games.length; i++) {
            if (this.games[i].playerPaddle1.client == playerClient || this.games[i].playerPaddle2.client == playerClient) {
                return
            }
            if (!this.games[i].playerPaddle1.client) {
                this.games[i].playerPaddle1.client = playerClient
                return
            }
            else if (!this.games[i].playerPaddle2.client) {
                this.games[i].playerPaddle2.client = playerClient
                return
            }
        }
        let game = new Game
        game.playerPaddle1.client = playerClient
        this.games.push(game)
    }
    RemovePlayerFromGame(client: Socket) {
      console.log("PlayerExited " + client)
        for (let game of this.games) {
            if (game.playerPaddle1.client && game.playerPaddle1.client.id == client.id) {
                game.playerPaddle1.client = null
                game.playerPaddle2.client?.emit("PlayerDisconnected")
            } else if (game.playerPaddle2.client && game.playerPaddle2.client.id == client.id) {
                game.playerPaddle1.client?.emit("PlayerDisconnected")
                game.playerPaddle2.client = null
            }
        }
    }
  PlayerKeyUp(client: Socket, key: string) {
    for (let game of this.games) {
      if (game.playerPaddle1.client?.id === client.id) {
        if (key === "up") {
          game.playerPaddle1.movingUp = false
        }
        else if (key === "down") {
          game.playerPaddle1.movingDown = false
        }
      } else if (game.playerPaddle2.client?.id === client.id) {
        if (key === "up") {
          game.playerPaddle2.movingUp = false
        }
        else if (key === "down") {
          game.playerPaddle2.movingDown = false
        }
      }
    }
  }
    PlayerKeyDown(client: Socket, key: string) {
        for (let game of this.games) {
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

    UpdateAllPositions() {
        setInterval(() => {
          for (let game of this.games) {
            if (game.playerPaddle1.client && game.playerPaddle2.client) {
              game.update();
              game.emit();
            }
            else {
              game.playerPaddle1.client?.emit('WaitingForPlayers')
              game.playerPaddle2.client?.emit('WaitingForPlayers')
            }
          }
        }, 15
        )
      }
}
