import { WebSocket as WebSocketInstance } from "ws";
import { RoomManager } from "../room/RoomManager";
import { MessageType } from "../types/types";

export default function handleCreateRoom(
  connection: WebSocketInstance,
  index: number
) {
  const roomManager = RoomManager.getInstance();
  const roomId = roomManager.createRoom(index);

  connection.send(
    JSON.stringify({
      type: MessageType.UpdateRoom,
      data: JSON.stringify([
        {
          roomId,
          roomUsers: [{ name: `Player ${index + 1}`, index: index }],
        },
      ]),
      id: 0,
    })
  );
}
