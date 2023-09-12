import { User } from 'src/db_interactions_modules/users/user.entity'
import { Repository } from 'typeorm'
import { Socket } from 'socket.io';

export class UserSocketArray {
    client: Socket | null
    user: User
    privateWindow: string
    userAgent: string
    constructor(user_ : User, socket_ : Socket, privateWindow: string, userAgent: string) {
        this.user = user_
        this.client = socket_
        this.privateWindow = privateWindow
        this.userAgent = userAgent
    }
}

