import { Socket } from 'socket.io';
import { User } from 'src/db_interactions_modules/users/user.entity';

export class PlayerPaddle {
    frontEndData: {
        x: number
        y: number
        height: number
        width: number
        nick: string
        skin: string
    }
    client: Socket
    movingDown: Boolean
    movingUp: Boolean
    user: User
    ready: Boolean
    constructor(client: Socket, user: User, skin: string) {
        this.frontEndData = {
            x: -1,
            y: -1,
            width: 20,
            height: 100,
            nick: user.intra_nick,
            skin: skin
        };
        this.client = client
        this.user = user
        this.ready = false
    }
    setInitialPosition(x: number, y: number)
    {
      this.frontEndData.x = x
      this.frontEndData.y = y
    }
    updatePosition(canvasHeight: number): void {
        if (this.movingDown && this.frontEndData.y + this.frontEndData.height + 10 < canvasHeight) {
            this.frontEndData.y += 10
        } else if (this.movingUp && this.frontEndData.y > 0) {
            this.frontEndData.y -= 10
        }
    }
    resetPositions(x: number, y: number, width: number, height: number): void {
        this.frontEndData.x = x
        this.frontEndData.y = y
        this.frontEndData.width = width
        this.frontEndData.height = height
        this.movingDown = false
        this.movingUp = false
    }
    handlePlayersNotReady()
    {
      if (this.ready)
      {
        this.client.emit("WaitingOtherPlayer")
      }
      else
      {
        this.client.emit("GetReady")
      }
    }
}
