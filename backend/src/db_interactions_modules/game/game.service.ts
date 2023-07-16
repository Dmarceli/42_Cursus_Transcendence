import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Game } from './classes/Game'
import { GameHistoryService } from '../game_history/game_history.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class GameService {
  constructor(private readonly gameHistoryService: GameHistoryService, @InjectRepository(User) private userRepository: Repository<User>){}
  games: Game[] = []
  async AddPlayerToGame(playerClient: Socket, nick: string) {
    console.log("NewPlayer " + playerClient + " with intra " + nick)
    const user = await this.userRepository.findOne({where: {intra_nick: nick}})
    for (let i = 0; i < this.games.length; i++) {
      if (this.games[i].playerPaddle1.frontEndData.nick == nick) {
        this.games[i].playerPaddle1.user = user
        this.games[i].playerPaddle1.client = playerClient
        return
      }
      if (this.games[i].playerPaddle2.frontEndData.nick == nick) {
        this.games[i].playerPaddle2.user = user
        this.games[i].playerPaddle2.client = playerClient
        return
      }
    }
    for (let i = 0; i < this.games.length; i++) {
      if (this.games[i].playerPaddle1.client == playerClient || this.games[i].playerPaddle1.client == playerClient)
        return
      if (!this.games[i].playerPaddle1.client) {
        this.games[i].playerPaddle1.user = user
        this.games[i].playerPaddle1.frontEndData.nick = nick
        this.games[i].playerPaddle1.client = playerClient
        return
      }
      else if (!this.games[i].playerPaddle2.client) {
        this.games[i].playerPaddle2.user = user
        this.games[i].playerPaddle2.frontEndData.nick = nick
        this.games[i].playerPaddle2.client = playerClient
        return
      }
    }
    let game = new Game(this.gameHistoryService, this.userRepository)
    game.playerPaddle1.client = playerClient
    game.playerPaddle1.frontEndData.nick = nick
    game.playerPaddle1.user = user
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

  async UpdateAllPositions() {
    while (true) {
      for (let game of this.games) {
        if (game.playerPaddle1.client && game.playerPaddle2.client) {
          game.update();
          await game.checkStatus();
        }
        else {
          game.playerPaddle1.client?.emit('WaitingForPlayers')
          game.playerPaddle2.client?.emit('WaitingForPlayers')
        }
      }
      await this.delay(15);
    }
  }
  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
