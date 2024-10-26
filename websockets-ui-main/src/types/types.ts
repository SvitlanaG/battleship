export enum MessageType {
  Reg = "reg",
  UpdateWinners = "update_winners",
  CreateRoom = "create_room",
  AddUserToRoom = "add_user_to_room",
  CreateGame = "create_game",
  UpdateRoom = "update_room",
  AddShips = "add_ships",
  StartGame = "start_game",
  Attack = "attack",
  RandomAttack = "randomAttack",
  Turn = "turn",
  Finish = "finish",
}

export type ParsedUserData = { name: string; password: string };
export type ParsedAddUserToRoomData = { indexRoom: number | string };
export type ParsedCreateGameData = {
  idGame: number | string;
  idPlayer: number | string;
};

export type ParsedData =
  | ParsedUserData
  | ParsedAddUserToRoomData
  | ParsedCreateGameData;
