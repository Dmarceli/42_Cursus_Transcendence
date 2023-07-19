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
import { UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { GameService } from '../game/game.service';
import { UsersService } from '../users/users.service';


@WebSocketGateway({
  cors: {
    origin: '*',
  },
 })
 export class AppGateway
 implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
 constructor(private appService: AppService, private gameService: GameService, private usersService: UsersService  ) {}
 
 @WebSocketServer() server: Server;
 
 @SubscribeMessage('sendMessage')
 @UsePipes(new ValidationPipe())
 async handleSendMessage(client: Socket, payload: CreateMsgDto): Promise<void> {
  console.log(new Date(),payload)
   await this.appService.createMessage(payload);
   this.server.emit('recMessage', payload);
 }
 
 afterInit(server: Server) {
  this.gameService.UpdateAllPositions()
 }
 
 handleDisconnect(client: Socket) {
   console.log(`Disconnected: ${client.id}`);
   this.usersService.remove_disconnect_User(client)
   this.gameService.RemovePlayerFromGame(client)
 }
 
 //1º step após conexão
 async handleConnection(client: Socket/* ...args: any[]*/) {
  const authorization = await this.usersService.addUserToLobby(client)
  console.log(`Connected ${client.id}`);
  if(!authorization)
    client.disconnect();
 }

// Game Service
  @SubscribeMessage('NewPlayer')
  handleNewPlayer(client: Socket, intra_nick: string) {
    this.gameService.AddPlayerToGame(client, intra_nick)
  }
  @SubscribeMessage('PlayerExited')
  handlePlayerExited(client: Socket) {
    this.gameService.RemovePlayerFromGame(client)
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
