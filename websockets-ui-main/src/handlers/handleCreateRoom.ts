import { WebSocket as WebSocketInstance } from "ws";
import { RoomManager } from "../room/RoomManager";
import { MessageType } from "../types/types";
import { User } from "../user/User";

export default function handleCreateRoom(
  connection: WebSocketInstance,
  index: number
) {
  const roomManager = RoomManager.getInstance();
  roomManager.createRoom(index);

  try {
    const roomList = roomManager.getAllRooms().map((room) => ({
      roomId: room.roomId,
      roomUsers: room.getUsers().map((user: User) => ({
        name: user.name,
        index: index,
      })),
    }));

    connection.send(
      JSON.stringify({
        type: MessageType.UpdateRoom,
        data: JSON.stringify(roomList),
        id: 0,
      })
    );
  } catch {
    connection.send(
      JSON.stringify({
        type: "error",
        data: JSON.stringify({ errorText: "Failed to join the room" }),
        id: 0,
      })
    );
  }
}
