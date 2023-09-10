import { Socket } from 'socket.io';
import { User } from 'src/db_interactions_modules/users/user.entity';

const board_dims = {
  width: 1400,
  height: 700
}

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
    disconnected_date: Date | null
    constructor(client: Socket, user: User, skin: string) {
        this.frontEndData = {
            x: -1,
            y: -1,
            width: 20,
            height: 110,
            nick: user.intra_nick,
            skin: skin
        };
        this.client = client
        this.user = user
        this.ready = false
        this.disconnected_date = null
    }
    setInitialPosition(x: number, y: number)
    {
      this.frontEndData.x = x
      this.frontEndData.y = y
    }
    updatePosition(canvasHeight: number): void {
        if (this.movingDown && this.frontEndData.y + this.frontEndData.height + 8 <= canvasHeight) {
            this.frontEndData.y += 8
        } else if (this.movingUp && this.frontEndData.y >= 0) {
            this.frontEndData.y -= 8
        }
    }
    resetPositions(x: number, y: number, width: number, height: number): void {
      this.frontEndData.width = width
        this.frontEndData.x = x
        this.frontEndData.y = (board_dims.height/2)-(this.frontEndData.height/2)
        this.frontEndData.height = height
        this.movingDown = false
        this.movingUp = false
    }
}
