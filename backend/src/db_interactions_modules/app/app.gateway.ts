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
 constructor(private appService: AppService, private gameService: GameService, private usersService: UsersService) { }
 
 @WebSocketServer() server: Server;
 
 @SubscribeMessage('sendMessage')
 @UsePipes(new ValidationPipe())
 async handleSendMessage(client: Socket, payload: CreateMsgDto): Promise<void> {
  await this.appService.createMessage(payload);
  this.server.to(payload.channelId.toString()).emit('recMessage', payload);

 }
 
 afterInit(server: Server) {
  this.gameService.UpdateAllPositions()
 }
 
 handleDisconnect(client: Socket) {
   this.appService.user_remove_disconect(client)
   this.gameService.HandlePlayerDisconnected(client)
   AppService.UsersOnline.forEach((user) => {
   user.client.emit("online-status-update");
  })
 }

 //1º step após conexão
 async handleConnection(client: Socket, server: Server, @Res() res: any) {
  let Channel_List:string [] = [];
  const authorization = await this.appService.add_user_to_lobby(client, server,Channel_List)
  client.join(Channel_List)
  if(!authorization){
    client.emit('logout')
    client.disconnect();
    console.log(`Disconnected Auth missing -  ${client.id}`)
  }
  AppService.UsersOnline.forEach((user) => {
    user.client.emit("online-status-update");
  })
}

// Game Service
  @SubscribeMessage('GetUpdatedState')
  handleGetUpdatedState(client: Socket, intra_nick: string)
  {
    this.gameService.EmitUpdatedState(client, intra_nick)
  }
  @SubscribeMessage('PlayerSelectedPaddle')
  handlePlayerSelectedPaddle(client: Socket, info: any) {
    let [intra_nick, paddleSkin] = info;
    if (this.gameService.IsInPrivateGame(intra_nick))
      this.gameService.CreatePrivateGamePlayer(client, intra_nick, paddleSkin);
    else
      this.gameService.CreateLobbyPlayer(client, intra_nick, paddleSkin);
  }

  @SubscribeMessage('AddToLobby')
  handleAddPlayerToLobby(client: Socket, intra_nick: string) {
    this.gameService.AddPlayerToLobby(client, intra_nick)
  }
  @SubscribeMessage('PlayerReady')
  handlePlayerReady(client: Socket, intra_nick: string) {
    this.gameService.PlayerReady(client, intra_nick)
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
