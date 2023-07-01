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
import { UsePipes, ValidationPipe } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
 })
 export class AppGateway
 implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
 constructor(private appService: AppService) {}
 
 @WebSocketServer() server: Server;
 
 @SubscribeMessage('sendMessage')
 @UsePipes(new ValidationPipe())
 async handleSendMessage(client: Socket, payload: CreateMsgDto): Promise<void> {
  console.log(new Date(),payload)
   await this.appService.createMessage(payload);
   this.server.emit('recMessage', payload);
 }
 
 afterInit(server: Server) {
   
 }
 
 handleDisconnect(client: Socket) {
   console.log(`Disconnected: ${client.id}`);
 }
 
 handleConnection(client: Socket, ...args: any[]) {
   console.log(`Connected ${client.id}`);
 }


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