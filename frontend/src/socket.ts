
import { io } from 'socket.io-client'

const socket = io(process.env.VUE_APP_BACKEND_URL);

export default socket