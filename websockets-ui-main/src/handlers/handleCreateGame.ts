import { WebSocket as WebSocketInstance } from "ws";
import { RoomManager } from "../room/RoomManager";
import { MessageType } from "../types/types";

export default function handleCreateGame(
  connections: WebSocketInstance[],
  roomId: number
) {
  const roomManager = RoomManager.getInstance();
  const room = roomManager.getRoomById(roomId);

  if (!room) {
    console.error("Room not found");
    return;
  }

  const players = room.getUsers();
  const idGame = room.getGameId();

  if (players.length < 2) {
    console.error("Not enough players to start a game.");
    return;
  }

  players.forEach((player, index) => {
    const playerData = {
      idGame,
      idPlayer: player.id,
    };

    try {
      connections[index].send(
        JSON.stringify({
          type: MessageType.CreateGame,
          data: JSON.stringify(playerData),
          id: 0,
        })
      );
    } catch (error) {
      connections[index].send(
        JSON.stringify({
          type: "error",
          data: JSON.stringify({ errorText: "Failed to create a game" }),
          id: 0,
        })
      );
    }
  });
}
