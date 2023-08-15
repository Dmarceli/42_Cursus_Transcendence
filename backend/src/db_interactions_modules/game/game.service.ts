import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Game } from './classes/Game'
import { GameHistoryService } from '../game_history/game_history.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { PlayerPaddle } from './classes/PlayerPaddle';
import { AppService } from 'src/app.service';

export class PrivateGame
{
  player1: string
  player2: string
  constructor(player1: string, player2: string)
  {
    this.player1 = player1;
    this.player2 = player2
  }
}
interface UserStatus {
  id: number,
  status: number
}
@Injectable()
export class GameService {
  lobbyPlayers: PlayerPaddle[] = []
  privateGamePlayers: PlayerPaddle[] = []
  lobby: PlayerPaddle[] = []
  private_games: PrivateGame[] = []
  active_games: Game[] = []

  constructor(private readonly gameHistoryService: GameHistoryService, @InjectRepository(User) private userRepository: Repository<User>) { }

  getPrivate()
  {
    return this.private_games;
  }

  async CreateLobbyPlayer(playerClient: Socket, nick: string, skin: string="")
  {
    console.log("Creating new Lobby Player " + playerClient + " with intra " + nick + " and skin " + skin)
    const user = await this.userRepository.findOne({ where: { intra_nick: nick } })
    let newPlayer = new PlayerPaddle(playerClient, user, skin);
    this.lobbyPlayers.push(newPlayer);
  }

  AddPlayerToLobby(playerClient: Socket, nick: string)
  {
    const freePlayerIndex = this.lobbyPlayers.findIndex(player => player.user.intra_nick === nick)
    if (freePlayerIndex !== -1) {
      if (this.lobbyPlayers[freePlayerIndex].client != playerClient)
      {
        this.lobbyPlayers[freePlayerIndex].client = playerClient
      }
      if (this.ReconnectedPlayer(this.lobbyPlayers[freePlayerIndex], nick))
      {
        console.log("Reconnected "+nick)
      }
      else
      {
        console.log("Joined lobby "+nick)
        this.lobby.push(this.lobbyPlayers[freePlayerIndex])
      }
      this.lobbyPlayers.splice(freePlayerIndex, 1);
    }
  }

  IsInGame(user: User)
  {
    return (this.active_games.some((game: Game)=>{
      return (game.playerPaddle1.user.id==user.id ||  game.playerPaddle2.user.id==user.id)
    }));
  }

  IsInPrivateGame(intra_nick: string)
  {
    return (this.private_games.some(private_game => private_game.player1 === intra_nick || private_game.player2 === intra_nick));
  }

  async CreatePrivateGamePlayer(playerClient: Socket, nick: string, skin: string="")
  {
    console.log("Creating new Private Game Player " + playerClient + " with intra " + nick + " and skin " + skin)
    const user = await this.userRepository.findOne({ where: { intra_nick: nick } })
    let newPlayer = new PlayerPaddle(playerClient, user, skin);
    this.privateGamePlayers.push(newPlayer);
  }

  async createPrivateGame(player1_intra_nick: string, player2_intra_nick: string)
  {
    console.log("Creating new Private Game for " + player1_intra_nick + " and " + player2_intra_nick);
    if (this.IsInPrivateGame(player1_intra_nick))
    {
      console.log("Already existing game for player "+player1_intra_nick)
      return ;
    }
    if (this.IsInPrivateGame(player2_intra_nick))
    {
      console.log("Already existing game for player "+player2_intra_nick)
      return ;
    }
    const player1User = AppService.UsersOnline.find((online) => online.user.intra_nick == player1_intra_nick);
    const player2User = AppService.UsersOnline.find((online) => online.user.intra_nick == player2_intra_nick);
    if (player1User && player2User)
    {
      this.private_games.push(new PrivateGame(player1_intra_nick, player2_intra_nick));
      player1User.client?.emit("StartPaddleSelection");
      player2User.client?.emit("StartPaddleSelection");
    }
  }

  // TODO: This could be cheating as a way to change skin.
  // Change we could not update skin but after sending a
  // "Reconnecting 3 2 1" message
  ReconnectedPlayer(player: PlayerPaddle, nick: string): boolean
  {
    let player1ActiveGameIndex = this.active_games.findIndex(game => game.playerPaddle1.user.intra_nick === nick)
    if (player1ActiveGameIndex !== -1)
    {
      this.active_games[player1ActiveGameIndex].playerPaddle1.client = player.client
      this.active_games[player1ActiveGameIndex].playerPaddle1.frontEndData.skin = player.frontEndData.skin

      this.active_games[player1ActiveGameIndex].playerPaddle1.handlePlayersNotReady();
      this.active_games[player1ActiveGameIndex].playerPaddle2.handlePlayersNotReady();
      return true
    }
    let player2ActiveGameIndex = this.active_games.findIndex(game => game.playerPaddle2.user.intra_nick === nick)
    if (player2ActiveGameIndex !== -1)
    {
      this.active_games[player2ActiveGameIndex].playerPaddle2.client = player.client
      this.active_games[player2ActiveGameIndex].playerPaddle2.frontEndData.skin = player.frontEndData.skin

      this.active_games[player2ActiveGameIndex].playerPaddle1.handlePlayersNotReady();
      this.active_games[player2ActiveGameIndex].playerPaddle2.handlePlayersNotReady();
      return true
    }
    return false
  }

  PlayerReady(intra_nick: string) {
    for (let game of this.active_games) {
      if (game.playerPaddle1.user.intra_nick === intra_nick) {
        game.playerPaddle1.ready = true
        game.playerPaddle1.handlePlayersNotReady();
        game.playerPaddle2.handlePlayersNotReady();
      }
      else if (game.playerPaddle2.user.intra_nick === intra_nick)
        game.playerPaddle2.ready = true
        game.playerPaddle1.handlePlayersNotReady();
        game.playerPaddle2.handlePlayersNotReady();
    }
  }

  HandlePlayerDisconnected(client: Socket) {
    for (let game of this.active_games) {
      if (game.playerPaddle1.client && game.playerPaddle1.client.id == client.id) {
        game.playerPaddle1.ready = false
        game.playerPaddle2.client?.emit("PlayerDisconnected")
        console.log("PlayerExited " + game.playerPaddle1.user.intra_nick)
      } else if (game.playerPaddle2.client && game.playerPaddle2.client.id == client.id) {
        game.playerPaddle2.ready = false
        game.playerPaddle1.client?.emit("PlayerDisconnected")
        console.log("PlayerExited " + game.playerPaddle2.user.intra_nick)
      }
    }
  }
  PlayerKeyUp(client: Socket, key: string) {
    for (let game of this.active_games) {
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
    for (let game of this.active_games) {
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
      this.addPrivateGames();
      this.addLobbyGames();
      this.removeFinishedGames();
      for (let game of this.active_games) {
        if (game.playerPaddle1.client && game.playerPaddle2.client) {
          if (game.playerPaddle1.ready && game.playerPaddle2.ready) {
            if (!game.timeStart ) {
              if(!game.starting)
              {
                game.starting=true
                game.start();
              }
            } else {
              game.update();
              game.checkStatus();
            }
          }
        }
      }
    }, 15
    )
  }

  PrivateGameStillNotAdded(private_game: PrivateGame)
  {
    if (!this.privateGamePlayers)
      return true;
      const indexPlayer1 = this.privateGamePlayers.findIndex(private_player => private_player.user.intra_nick === private_game.player1);
      const indexPlayer2 = this.privateGamePlayers.findIndex(private_player => private_player.user.intra_nick === private_game.player2);
      if (indexPlayer1 !== -1 && indexPlayer2 !== -1)
      {
        console.log("ADDING PRIVATE GAME for player "+private_game.player1+" and "+private_game.player2)
        let game = new Game(this.privateGamePlayers[indexPlayer1], this.privateGamePlayers[indexPlayer2], this.gameHistoryService, this.userRepository)
        this.active_games.push(game)
        AppService.UsersOnline.forEach((user) => {
          user.client.emit("online-status-update");
        })
        if (indexPlayer1 > indexPlayer2)
        {
          this.privateGamePlayers.splice(indexPlayer1, 1);
          this.privateGamePlayers.splice(indexPlayer2, 1);
        }
        else
        {
          this.privateGamePlayers.splice(indexPlayer2, 1);
          this.privateGamePlayers.splice(indexPlayer1, 1);
        }
        return false;
      }
      return true;
  }

  addPrivateGames()
  {
    let updated_private_games = this.private_games.filter(this.PrivateGameStillNotAdded.bind(this))
    this.private_games = updated_private_games
  }

  addLobbyGames() {
    if (this.lobby.length < 2)
      return
    console.log("Creating new game between "+this.lobby[0].user.intra_nick+" and "+this.lobby[1].user.intra_nick)
    let game = new Game(this.lobby[0], this.lobby[1], this.gameHistoryService, this.userRepository)
    this.lobby.splice(0, 2)
    this.active_games.push(game)
    AppService.UsersOnline.forEach((user) => {
      user.client.emit("online-status-update");
    })
    game.playerPaddle1.handlePlayersNotReady();
    game.playerPaddle2.handlePlayersNotReady();
  }
  removeFinishedGames()
  {
    let updated_active_games = this.active_games.filter(game => !game.isFinished);
    if (updated_active_games.length != this.active_games.length) {
      AppService.UsersOnline.forEach((user) => {
        user.client.emit("online-status-update");
      })
    }
    this.active_games = updated_active_games;
  }

  // TODO: Remove Duplicated from app.gateway
  async emit_online_status() {
    let current_users = await this.userRepository.find()
    const allUserStatus: UserStatus[] = current_users.map((currentUser) => {
      let IsOnline = AppService.UsersOnline.some((userOnline) => {
        userOnline.user == currentUser;
      })
      let IsInGame = this.IsInGame(currentUser)
      console.log("GEELOYAL IN GAME")
      let onlineStatus = IsInGame ? 0 : IsOnline ? 1 : 2;
      return {
        id: currentUser.id,
        status: onlineStatus
      }
    });
    AppService.UsersOnline.forEach((user) => {
      user.client.emit("online-status-update", allUserStatus);
    })
  }

}