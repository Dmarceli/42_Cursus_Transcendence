export enum State {
  SETTING_PRIVATE_GAME = 1,
  LOBBY_PLAYER = 2,
  IN_LOBBY_QUEUE = 3,
  CHOSE_PRIVATE_PLAYER = 4,
  NOT_READY = 5,
  WAITING_OTHER_READY = 6,
  STARTING = 7,
  PLAYING = 8,
  DISCONNECTED = 9,
  OPPONENT_DISCONNECTED = 10,
}

export const StateMessage: { [key in State]: string } = {
  [State.LOBBY_PLAYER]: 'Player chose racket to join lobby',
  [State.IN_LOBBY_QUEUE]: 'Player waiting in Lobby',
  [State.SETTING_PRIVATE_GAME]: 'Player is preparing Private Game',
  [State.CHOSE_PRIVATE_PLAYER]: 'Player chose Private Game Racket',
  [State.NOT_READY]: 'Player is in Active game but still not ready',
  [State.WAITING_OTHER_READY]: 'Player waiting for other player to get ready',
  [State.STARTING]: 'Game is starting',
  [State.PLAYING]: 'Player is in active game',
  [State.DISCONNECTED]: 'OUR USER has disconnected',
  [State.OPPONENT_DISCONNECTED]: 'Other player has disconnected',
};