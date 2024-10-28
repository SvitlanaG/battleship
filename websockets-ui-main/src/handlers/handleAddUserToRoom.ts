import { WebSocket as WebSocketInstance } from "ws";
import { RoomManager } from "../room/RoomManager";
import { MessageType, ParsedAddUserToRoomData } from "../types/types";
import { User } from "../user/User";

export default function handleAddUserToRoom(
  parsedData: ParsedAddUserToRoomData,
  connection: WebSocketInstance,
  userIndex: number
) {
  const roomManager = RoomManager.getInstance();
  const { indexRoom } = parsedData;

  const success = roomManager.addUserToRoom(indexRoom, userIndex);

  if (success) {
    const roomList = roomManager.getAllRooms().map((room) => ({
      roomId: room.roomId,
      roomUsers: room.getUsers().map((user: User) => ({
        name: user.name,
        index: userIndex,
      })),
    }));

    connection.send(
      JSON.stringify({
        type: MessageType.UpdateRoom,
        data: JSON.stringify(roomList),
        id: 0,
      })
    );
    return indexRoom;
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
