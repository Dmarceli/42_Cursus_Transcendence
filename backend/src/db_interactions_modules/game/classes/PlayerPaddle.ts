import { Socket } from 'socket.io';
import { User } from 'src/db_interactions_modules/users/user.entity';

export class PlayerPaddle {
    frontEndData: {
        x: number
        y: number
        height: number
        width: number
        nick: string
    }
    client: Socket | null
    movingDown: Boolean
    movingUp: Boolean
    user: User
    ready: Boolean
    constructor(x: number, y: number, width: number, height: number) {
        this.frontEndData = {
            x: x,
            y: y,
            width: width,
            height: height,
            nick: ""
        };
        this.client = null
        this.user = null
        this.ready = false
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
}
