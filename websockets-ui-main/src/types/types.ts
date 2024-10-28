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

export type ShipType = "small" | "medium" | "large" | "huge";

export interface Position {
  x: number;
  y: number;
}

export interface Ship {
  position: Position;
  direction: boolean;
  length: number;
  type: ShipType;
}

export type ParsedUserData = { name: string; password: string };
export type ParsedAddUserToRoomData = { indexRoom: number };
export type ParsedCreateGameData = {
  idGame: number | string;
  idPlayer: number | string;
};
export type ParsedAddShipsData = {
  gameId: number | string;
  ships: Ship[];
  indexPlayer: number | string;
};

export type ParsedData =
  | ParsedUserData
  | ParsedAddUserToRoomData
  | ParsedCreateGameData
  | ParsedAddShipsData;
