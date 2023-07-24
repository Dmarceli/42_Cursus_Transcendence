import { User } from 'src/db_interactions_modules/users/user.entity'
import { Repository } from 'typeorm'
import { Socket } from 'socket.io';

export class UserSocketArray {
    client: Socket | null
    user: User
    constructor(user_ : User, socket_ : Socket) {
        this.user = user_
        this.client = socket_
    }
}

