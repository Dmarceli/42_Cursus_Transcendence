import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Game } from './classes/Game'
import { GameHistoryService } from '../game_history/game_history.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { PlayerPaddle } from './classes/PlayerPaddle';
import { AppService } from 'src/app.service';
import { State } from './classes/game-state-enum';

export class PrivateGame {
  player1: string
  player2: string
  constructor(player1: string, player2: string) {
    this.player1 = player1;
    this.player2 = player2
  }
}

@Injectable()
export class GameService {
  lobbyPlayers: PlayerPaddle[] = []
  privateGamePlayers: PlayerPaddle[] = []
  lobby: PlayerPaddle[] = []
  private_games: PrivateGame[] = []
  active_games: Game[] = []
  player_states: Map<string, State> = new Map()

  constructor(private readonly gameHistoryService: GameHistoryService, @InjectRepository(User) private userRepository: Repository<User>) { }

  getPrivate() {
    return this.private_games;
  }

  EmitUpdatedState(client: Socket, nick: string) {
    console.log(this.player_states)
    if (!this.player_states.has(nick)) {
      client.emit("UpdatedState", 0)
      return
    }
    client.emit("UpdatedState", this.player_states.get(nick))
  }

  SetPlayerStateEmit(client: Socket, nick: string, state: State) {
    this.player_states.set(nick, state)
    this.EmitUpdatedState(client, nick)
  }

  UpdatePlayerState(nick: string) {
    console.warn("Found mismatch on player state " + this.player_states[nick])
    let playerInActiveGame = this.active_games.find(active_games => active_games.playerPaddle1.user.intra_nick == nick || active_games.playerPaddle2.user.intra_nick == nick)
    if (playerInActiveGame) {
      if (playerInActiveGame.timeStart) {
        return this.player_states.set(nick, State.PLAYING)
      }
      else if (playerInActiveGame.starting) {
        return this.player_states.set(nick, State.STARTING)
      }
      let player = null;
      if (playerInActiveGame.playerPaddle1.user.intra_nick == nick)
        player = playerInActiveGame.playerPaddle1
      else
        player = playerInActiveGame.playerPaddle2
      if (player.ready) {
        return this.player_states.set(nick, State.WAITING_OTHER_READY)
      }
      else {
        return this.player_states.set(nick, State.NOT_READY)
      }
    }
    if (this.privateGamePlayers.find(playerPaddle => playerPaddle.user.intra_nick == nick)) {
      return this.player_states.set(nick, State.CHOSE_PRIVATE_PLAYER)
    }
    if (this.private_games.find(privateGame => privateGame.player1 == nick || privateGame.player2 == nick)) {
      return this.player_states.set(nick, State.SETTING_PRIVATE_GAME)
    }
    if (this.lobby.find(playerPaddle => playerPaddle.user.intra_nick == nick)) {
      return this.player_states.set(nick, State.IN_LOBBY_QUEUE)
    }
    if (this.lobbyPlayers.find(playerPaddle => playerPaddle.user.intra_nick == nick)) {
      return this.player_states.set(nick, State.LOBBY_PLAYER)
    }
    if (this.player_states.has(nick))
      return this.player_states.delete(nick)
  }

  async CreateLobbyPlayer(playerClient: Socket, nick: string, skin: string = "") {
    if (this.player_states.has(nick)) {
      this.UpdatePlayerState(nick)
      return;
    }
    console.log("Creating new Lobby Player " + playerClient + " with intra " + nick + " and skin " + skin)
    const user = await this.userRepository.findOne({ where: { intra_nick: nick } })
    let newPlayer = new PlayerPaddle(playerClient, user, skin);
    this.lobbyPlayers.push(newPlayer);
    this.SetPlayerStateEmit(playerClient, nick, State.LOBBY_PLAYER)
    console.log("LOBBY PLAYERS ARE " + this.lobbyPlayers.length)
  }

  AddPlayerToLobby(playerClient: Socket, nick: string) {
    if (!this.player_states.has(nick) || this.player_states.get(nick) != State.LOBBY_PLAYER) {
      this.UpdatePlayerState(nick)
      this.EmitUpdatedState(playerClient, nick)
      return;
    }
    const freePlayerIndex = this.lobbyPlayers.findIndex(player => player.user.intra_nick === nick)
    if (freePlayerIndex !== -1) {
      if (this.lobbyPlayers[freePlayerIndex].client != playerClient) {
        this.lobbyPlayers[freePlayerIndex].client = playerClient
      }
      if (this.ReconnectedPlayer(this.lobbyPlayers[freePlayerIndex], nick)) {
        console.log("Reconnected " + nick)
      }
      else {
        console.log("Joined lobby " + nick)
        this.lobby.push(this.lobbyPlayers[freePlayerIndex])
        this.SetPlayerStateEmit(playerClient, nick, State.IN_LOBBY_QUEUE)
      }
      this.lobbyPlayers.splice(freePlayerIndex, 1);
    }
  }

  IsInGame(user: User) {
    return (this.active_games.some((game: Game) => {
      return (game.playerPaddle1.user.id == user.id || game.playerPaddle2.user.id == user.id)
    }));
  }

  IsInPrivateGame(intra_nick: string) {
    return (this.private_games.some(private_game => private_game.player1 === intra_nick || private_game.player2 === intra_nick));
  }

  async CreatePrivateGamePlayer(playerClient: Socket, nick: string, skin: string = "") {
    if (!this.player_states.has(nick) || this.player_states.get(nick) != State.SETTING_PRIVATE_GAME) {
      this.UpdatePlayerState(nick)
      return;
    }
    console.log("Creating new Private Game Player " + playerClient + " with intra " + nick + " and skin " + skin)
    const user = await this.userRepository.findOne({ where: { intra_nick: nick } })
    let newPlayer = new PlayerPaddle(playerClient, user, skin);
    this.privateGamePlayers.push(newPlayer);
    this.SetPlayerStateEmit(playerClient, nick, State.CHOSE_PRIVATE_PLAYER)
  }

  async createPrivateGame(player1_intra_nick: string, player2_intra_nick: string) {
    if (this.player_states.has(player1_intra_nick) || this.player_states.has(player2_intra_nick)) {
      // Check if active games otherwise just remove them and continue creating
      this.UpdatePlayerState(player1_intra_nick)
      this.UpdatePlayerState(player2_intra_nick)
      return;
    }
    console.log("Creating new Private Game for " + player1_intra_nick + " and " + player2_intra_nick);
    if (this.IsInPrivateGame(player1_intra_nick)) {
      console.log("Already existing game for player " + player1_intra_nick)
      return;
    }
    if (this.IsInPrivateGame(player2_intra_nick)) {
      console.log("Already existing game for player " + player2_intra_nick)
      return;
    }
    const player1User = AppService.UsersOnline.find((online) => online.user.intra_nick == player1_intra_nick);
    const player2User = AppService.UsersOnline.find((online) => online.user.intra_nick == player2_intra_nick);
    if (player1User && player2User) {
      this.private_games.push(new PrivateGame(player1_intra_nick, player2_intra_nick));
      this.SetPlayerStateEmit(player1User.client, player1_intra_nick, State.SETTING_PRIVATE_GAME)
      this.SetPlayerStateEmit(player2User.client, player2_intra_nick, State.SETTING_PRIVATE_GAME)
      player1User.client?.emit("StartPaddleSelection");
      player2User.client?.emit("StartPaddleSelection");
    }
  }

  // TODO: This could be cheating as a way to change skin.
  // Change we could not update skin but after sending a
  // "Reconnecting 3 2 1" message
  ReconnectedPlayer(player: PlayerPaddle, nick: string): boolean {
    let player1ActiveGameIndex = this.active_games.findIndex(game => game.playerPaddle1.user.intra_nick === nick)
    if (player1ActiveGameIndex !== -1) {
      this.active_games[player1ActiveGameIndex].playerPaddle1.client = player.client
      this.active_games[player1ActiveGameIndex].playerPaddle1.frontEndData.skin = player.frontEndData.skin

      this.active_games[player1ActiveGameIndex].playerPaddle1.handlePlayersNotReady();
      this.active_games[player1ActiveGameIndex].playerPaddle2.handlePlayersNotReady();
      if (this.player_states.get(this.active_games[player1ActiveGameIndex].playerPaddle2.user.intra_nick) == State.DISCONNECTED) {
        this.SetPlayerStateEmit(this.active_games[player1ActiveGameIndex].playerPaddle1.client, this.active_games[player1ActiveGameIndex].playerPaddle1.user.intra_nick, State.OPPONENT_DISCONNECTED)
      }
      else {
        this.SetPlayerStateEmit(this.active_games[player1ActiveGameIndex].playerPaddle1.client, this.active_games[player1ActiveGameIndex].playerPaddle1.user.intra_nick, State.PLAYING)
        this.SetPlayerStateEmit(this.active_games[player1ActiveGameIndex].playerPaddle2.client, this.active_games[player1ActiveGameIndex].playerPaddle2.user.intra_nick, State.PLAYING)
      }
      return true
    }
    let player2ActiveGameIndex = this.active_games.findIndex(game => game.playerPaddle2.user.intra_nick === nick)
    if (player2ActiveGameIndex !== -1) {
      this.active_games[player2ActiveGameIndex].playerPaddle2.client = player.client
      this.active_games[player2ActiveGameIndex].playerPaddle2.frontEndData.skin = player.frontEndData.skin

      this.active_games[player2ActiveGameIndex].playerPaddle1.handlePlayersNotReady();
      this.active_games[player2ActiveGameIndex].playerPaddle2.handlePlayersNotReady();
      if (this.player_states.get(this.active_games[player2ActiveGameIndex].playerPaddle1.user.intra_nick) == State.DISCONNECTED) {
        this.SetPlayerStateEmit(this.active_games[player2ActiveGameIndex].playerPaddle2.client, this.active_games[player2ActiveGameIndex].playerPaddle2.user.intra_nick, State.OPPONENT_DISCONNECTED)
      }
      else {
        this.SetPlayerStateEmit(this.active_games[player2ActiveGameIndex].playerPaddle1.client, this.active_games[player2ActiveGameIndex].playerPaddle1.user.intra_nick, State.PLAYING)
        this.SetPlayerStateEmit(this.active_games[player2ActiveGameIndex].playerPaddle2.client, this.active_games[player2ActiveGameIndex].playerPaddle2.user.intra_nick, State.PLAYING)
      }
      return true
    }
    return false
  }

  PlayerReady(client: Socket, intra_nick: string) {
    for (let game of this.active_games) {
      if (game.playerPaddle1.user.intra_nick === intra_nick) {
        game.playerPaddle1.client = client
        game.playerPaddle1.ready = true
        if (game.playerPaddle2.ready) {
          if (game.timeStart) {
            console.log("LETS PLAY 1")
            this.SetPlayerStateEmit(game.playerPaddle1.client, game.playerPaddle1.user.intra_nick, State.PLAYING)
            this.SetPlayerStateEmit(game.playerPaddle2.client, game.playerPaddle2.user.intra_nick, State.PLAYING)
          } else {
            console.log("LETS START 1")
            this.SetPlayerStateEmit(game.playerPaddle1.client, game.playerPaddle1.user.intra_nick, State.STARTING)
            this.SetPlayerStateEmit(game.playerPaddle2.client, game.playerPaddle2.user.intra_nick, State.STARTING)
          }
        }
        else {
          console.log("WAITING 1")
          this.SetPlayerStateEmit(game.playerPaddle1.client, game.playerPaddle1.user.intra_nick, State.WAITING_OTHER_READY)
        }
      }
      else if (game.playerPaddle2.user.intra_nick === intra_nick) {
        game.playerPaddle2.client = client
        game.playerPaddle2.ready = true
        if (game.playerPaddle1.ready) {
          if (game.timeStart) {
            console.log("LETS PLAY 2")
            this.SetPlayerStateEmit(game.playerPaddle1.client, game.playerPaddle1.user.intra_nick, State.PLAYING)
            this.SetPlayerStateEmit(game.playerPaddle2.client, game.playerPaddle2.user.intra_nick, State.PLAYING)
          } else {
            console.log("LETS START 2")
            this.SetPlayerStateEmit(game.playerPaddle1.client, game.playerPaddle1.user.intra_nick, State.STARTING)
            this.SetPlayerStateEmit(game.playerPaddle2.client, game.playerPaddle2.user.intra_nick, State.STARTING)
          }
        }
        else {
          console.log("WAITING 2")
          this.SetPlayerStateEmit(game.playerPaddle2.client, game.playerPaddle2.user.intra_nick, State.WAITING_OTHER_READY)
        }
      }
    }
    console.log(this.active_games.length)
  }

  HandlePlayerDisconnected(client: Socket) {
    for (let game of this.active_games) {
      if (game.playerPaddle1.client && game.playerPaddle1.client.id == client.id) {
        game.playerPaddle1.ready = false
        this.SetPlayerStateEmit(game.playerPaddle1.client, game.playerPaddle1.user.intra_nick, State.DISCONNECTED)
        this.SetPlayerStateEmit(game.playerPaddle2.client, game.playerPaddle2.user.intra_nick, State.OPPONENT_DISCONNECTED)
        console.log("PlayerExited " + game.playerPaddle1.user.intra_nick)
      } else if (game.playerPaddle2.client && game.playerPaddle2.client.id == client.id) {
        game.playerPaddle2.ready = false
        this.SetPlayerStateEmit(game.playerPaddle1.client, game.playerPaddle1.user.intra_nick, State.OPPONENT_DISCONNECTED)
        this.SetPlayerStateEmit(game.playerPaddle2.client, game.playerPaddle2.user.intra_nick, State.DISCONNECTED)
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
      this.addPrivateGames(this.player_states);
      this.addLobbyGames();
      this.removeFinishedGames();
      for (let game of this.active_games) {
        if (game.playerPaddle1.client && game.playerPaddle2.client) {
          if (game.playerPaddle1.ready && game.playerPaddle2.ready) {
            if (!game.timeStart) {
              if (!game.starting) {
                game.starting = true
                game.start(this.player_states);
              }
            } else {
              game.update();
              game.checkStatus(this.player_states);
            }
          }
        }
      }
    }, 15
    )
  }

  PrivateGameStillNotAdded(private_game: PrivateGame, player_states) {
    if (!this.privateGamePlayers){
      return true;
    }
    const indexPlayer1 = this.privateGamePlayers.findIndex(private_player => private_player.user.intra_nick === private_game.player1);
    const indexPlayer2 = this.privateGamePlayers.findIndex(private_player => private_player.user.intra_nick === private_game.player2);
    if (indexPlayer1 !== -1 && indexPlayer2 !== -1) {
      console.log("ADDING PRIVATE GAME for player " + private_game.player1 + " and " + private_game.player2)
      let game = new Game(this.privateGamePlayers[indexPlayer1], this.privateGamePlayers[indexPlayer2], this.gameHistoryService, this.userRepository)
      this.active_games.push(game)
      this.SetPlayerStateEmit(this.privateGamePlayers[indexPlayer1].client, this.privateGamePlayers[indexPlayer1].user.intra_nick, State.NOT_READY)
      this.SetPlayerStateEmit(this.privateGamePlayers[indexPlayer2].client, this.privateGamePlayers[indexPlayer2].user.intra_nick, State.NOT_READY)
      AppService.UsersOnline.forEach((user) => {
        user.client.emit("online-status-update");
      })
      if (indexPlayer1 > indexPlayer2) {
        this.privateGamePlayers.splice(indexPlayer1, 1);
        this.privateGamePlayers.splice(indexPlayer2, 1);
      }
      else {
        this.privateGamePlayers.splice(indexPlayer2, 1);
        this.privateGamePlayers.splice(indexPlayer1, 1);
      }
      return false;
    }
    return true;
  }

  addPrivateGames(player_states) {
    let updated_private_games = this.private_games.filter(this.PrivateGameStillNotAdded.bind(this), player_states)
    this.private_games = updated_private_games
  }

  addLobbyGames() {
    if (this.lobby.length < 2)
      return
    console.log("Creating new game between " + this.lobby[0].user.intra_nick + " and " + this.lobby[1].user.intra_nick)
    let game = new Game(this.lobby[0], this.lobby[1], this.gameHistoryService, this.userRepository)
    this.lobby.splice(0, 2)
    this.active_games.push(game)
    AppService.UsersOnline.forEach((user) => {
      user.client.emit("online-status-update");
    })
    this.SetPlayerStateEmit(game.playerPaddle1.client, game.playerPaddle1.user.intra_nick, State.NOT_READY)
    this.SetPlayerStateEmit(game.playerPaddle2.client, game.playerPaddle2.user.intra_nick, State.NOT_READY)
  }
  removeFinishedGames() {
    let updated_active_games = this.active_games.filter(game => !game.isFinished);
    if (updated_active_games.length != this.active_games.length) {
      AppService.UsersOnline.forEach((user) => {
        user.client.emit("online-status-update");
      })
    }
    this.active_games = updated_active_games;
  }
}