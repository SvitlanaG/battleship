import { WebSocket as WebSocketInstance } from "ws";
import { RoomManager } from "../room/RoomManager";
import { MessageType, ParsedAddShipsData } from "../types/types";

export default function handleAddShips(
  parsedData: ParsedAddShipsData,
  connection: WebSocketInstance,
  index: number
) {
  const roomManager = RoomManager.getInstance();
  const { gameId, ships, indexPlayer } = parsedData;

  const room = roomManager.getRoomByGameId(Number(gameId));
  console.log("room ", room);
  if (!room) {
    connection.send(
      JSON.stringify({
        type: "error",
        data: JSON.stringify({ errorText: "Room not found" }),
        id: 0,
      })
    );
    return;
  }

  try {
    console.log(
      `Adding ships for player with indexPlayer ${indexPlayer} in room ${room.roomId}`
    );
    room.addShipsForPlayer(Number(indexPlayer), ships);
    console.log(
      `Ships added for player ${indexPlayer}. Checking if all ships are placed...`
    );
  } catch (error) {
    connection.send(
      JSON.stringify({
        type: "error",
        data: JSON.stringify({ errorText: "Failed to add ships" }),
        id: 0,
      })
    );
    return;
  }

  if (room.areAllShipsPlaced()) {
    console.log("All Ships are Placed! Starting the game...");

    room.getUsers().forEach((player, playerIndex) => {
      console.log(`Notifying player ${player.name} about game start`);
      connection.send(
        JSON.stringify({
          type: MessageType.StartGame,
          data: JSON.stringify({
            ships: room.getShipsForPlayer(player.id),
            currentPlayerIndex: indexPlayer,
          }),
          id: 0,
        })
      );
    });
    console.log(
      `Game started in room ${room.roomId}. Current game state:`,
      room.getRoomState()
    );
    room.startGame();
  } else {
    console.log(`Not all ships are placed yet in room ${room.roomId}`);
  }
}
