import { Socket } from 'socket.io';

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

    constructor(x: number, y: number, width: number, height: number) {
        this.init(x, y, width, height)
        this.client = null
    }
    updatePosition(canvasHeight: number): void {
        if (this.movingDown && this.frontEndData.y + this.frontEndData.height + 10 < canvasHeight) {
            this.frontEndData.y += 10
        } else if (this.movingUp && this.frontEndData.y > 0) {
            this.frontEndData.y -= 10
        }
    }
    init(x: number, y: number, width: number, height: number): void {
        this.frontEndData = {
            x: x,
            y: y,
            width: width,
            height: height,
            nick: ""
        };
        this.movingDown = false
        this.movingUp = false
    }
}
