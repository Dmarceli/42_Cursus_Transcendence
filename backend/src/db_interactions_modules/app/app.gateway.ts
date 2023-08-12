import {
SubscribeMessage,
WebSocketGateway,
OnGatewayInit,
WebSocketServer,
OnGatewayConnection,
OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';
import { AppService } from '../../app.service';
import { CreateMsgDto } from '../messages/dtos/message.dto';
import { UsePipes, ValidationPipe, UseGuards, Res } from '@nestjs/common';
import { GameService } from '../game/game.service';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { PrivateGameDto } from '../game/dtos/game.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
 })
 export class AppGateway
 implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
 constructor(private appService: AppService, private gameService: GameService ) {}
 
 @WebSocketServer() server: Server;
 
 @SubscribeMessage('sendMessage')
 @UsePipes(new ValidationPipe())
 async handleSendMessage(client: Socket, payload: CreateMsgDto): Promise<void> {

  //console.log(new Date(),payload)
  //console.log("ROOM-",payload.channelId.toString(), client.id)
  //console.log( this.server.sockets.adapter.rooms.get(payload.channelId.toString()))
  //console.log(payload)
  await this.appService.createMessage(payload);
  this.server.to(payload.channelId.toString()).emit('recMessage', payload);

 }
 
 afterInit(server: Server) {
  this.gameService.UpdateAllPositions()
 }
 
 handleDisconnect(client: Socket) {
   console.log(`Disconnected: ${client.id}`);
   this.appService.user_remove_disconect(client)
   this.gameService.HandlePlayerDisconnected(client)
 }
 
 //1º step após conexão
 async handleConnection(client: Socket, server: Server, @Res() res: any) {
  console.log(`Connected ${client.id}`);
  let Channel_List:string [] = [];
  const authorization = await this.appService.add_user_to_lobby(client, server,Channel_List)
  client.join(Channel_List)
  if(!authorization){
		client.emit('logout')
    client.disconnect();
    console.log(`Discnnected Auth missing -  ${client.id}`)
  }
 }

// Game Service
  @SubscribeMessage('PlayerSelectedPaddle')
  handlePlayerSelectedPaddle(client: Socket, info: any) {
    let [intra_nick, paddleSkin] = info;
    if (this.gameService.IsInPrivateGame(intra_nick))
      this.gameService.CreatePrivateGamePlayer(client, intra_nick, paddleSkin);
    else
      this.gameService.CreateLobbyPlayer(client, intra_nick, paddleSkin);
    client.emit("PlayerCreated")
  }

  @SubscribeMessage('InviteToGame')
  handleInviteToGame(client: Socket, opponent_id: number)
  {
    console.log("INVITING TO GAME "+opponent_id)
    // const opponent = AppService.UsersOnline.find((online) => online.user.id == opponent_id);
    // opponent.client?.emit("NewGameInvite");
    // Find client id of opponent
    // Notify other user
  }

  @SubscribeMessage('PrivateGame')
  handlePrivateGame(client: Socket, privateGame: PrivateGameDto)
  {
    console.log(privateGame);
    this.gameService.createPrivateGame(client, privateGame.player1_intra_nick, privateGame.player2_intra_nick);
    const opponent = AppService.UsersOnline.find((online) => online.user.id == privateGame.opponent_id);
    client?.emit("NewGameInvite");
    opponent.client?.emit("NewGameInvite");
  }

  @SubscribeMessage('AddToLobby')
  handleAddPlayerToLobby(client: Socket, intra_nick: string) {
    this.gameService.AddPlayerToLobby(client, intra_nick)
  }
  @SubscribeMessage('PlayerReady')
  handlePlayerReady(client: Socket, intra_nick: string) {
    console.log("New Player ready "+intra_nick)
    this.gameService.PlayerReady(intra_nick)
  }
  @SubscribeMessage('keydown')
  handlePlayerKeyDown(client: Socket, key: string)
  {
    this.gameService.PlayerKeyDown(client, key)
  }
  @SubscribeMessage('keyup')
  handlePlayerKeyUp(client: Socket, key: string)
  {
    this.gameService.PlayerKeyUp(client, key)
  }
}
