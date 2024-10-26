import { WebSocket as WebSocketInstance } from "ws";
import { RoomManager } from "../room/RoomManager";
import { MessageType, ParsedAddUserToRoomData } from "../types/types";

export default function handleAddUserToRoom(
  parsedData: ParsedAddUserToRoomData,
  connection: WebSocketInstance,
  index: number
) {
  const roomManager = RoomManager.getInstance();
  const { indexRoom } = parsedData;

  const success = roomManager.addUserToRoom(indexRoom, index);

  if (success) {
    connection.send(
      JSON.stringify({
        type: MessageType.CreateGame,
        data: JSON.stringify({
          idGame: roomManager.getGameId(),
          idPlayer: index,
        }),
        id: 0,
      })
    );
  } else {
    connection.send(
      JSON.stringify({
        type: "error",
        data: JSON.stringify({ errorText: "Failed to join the room" }),
        id: 0,
      })
    );
  }
}
