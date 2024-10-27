import { WebSocketServer, WebSocket as WebSocketInstance } from "ws";
import { MessageType, ParsedData } from "../types/types";
import handleCreateRoom from "../handlers/handleCreateRoom";
import handlePlayerRegistration from "../handlers/handlePlayerRegistration";
import handleAddUserToRoom from "../handlers/handleAddUserToRoom";
import handleCreateGame from "../handlers/handleCreateGame";
import { RoomManager } from "../room/RoomManager";

interface Client {
  connection: WebSocketInstance;
  id: number;
  index: number;
}

interface Message {
  type: MessageType;
  data: string;
  id: number;
}

const MAX_CLIENTS = 2;

export const startWebSocketServer = (port: number) => {
  const clients: Client[] = [];
  let clientIndexCounter = 0;
  const roomManager = RoomManager.getInstance();
  const wsServer = new WebSocketServer({ port, clientTracking: true });
  console.log(`WebSocket Server is running on port ${port}!`);

  wsServer.on("connection", (connection: WebSocketInstance) => {
    if (clients.length >= MAX_CLIENTS) {
      connection.send(
        JSON.stringify({
          type: "error",
          data: JSON.stringify({
            errorText: "Maximum number of clients reached",
          }),
          id: 0,
        })
      );
      connection.close();
      return;
    }

    const id = 0;
    const index = clientIndexCounter++;

    clients.push({ connection, id, index });
    console.log(`Client connected with index: ${index} and ID: ${id}`);

    connection.on("message", (message) => {
      let result: Message;

      try {
        result = JSON.parse(message.toString()) as Message;
        console.log(`Received message from client ${index}: `, result);
      } catch (error) {
        console.error("Invalid JSON format", error);
        connection.send(
          JSON.stringify({
            type: "error",
            data: JSON.stringify({ errorText: "Invalid JSON format" }),
            id: id,
          })
        );
        return;
      }

      let parsedData: ParsedData;
      try {
        if (result.data || result.data.trim() !== "") {
          parsedData = JSON.parse(result.data);
        }
      } catch (error) {
        console.error("Invalid data format", error);
        connection.send(
          JSON.stringify({
            type: "error",
            data: JSON.stringify({ errorText: "Invalid data format" }),
            id: id,
          })
        );
        return;
      }
      console.log("TYPE : ", result.type);
      switch (result.type) {
        case MessageType.Reg:
          handlePlayerRegistration(parsedData, connection, id, index);
          break;
        case MessageType.CreateRoom:
          handleCreateRoom(connection, index);
          break;
        case MessageType.AddUserToRoom:
          handleAddUserToRoom(parsedData, connection, index);
          const room = roomManager.getRoomById(index);
          if (room && room.getUsers().length === 2) {
            const roomConnections = clients.map((client) => client.connection);
            handleCreateGame(roomConnections, room.roomId);
          }
          break;
        default:
          connection.send(
            JSON.stringify({
              type: "error",
              data: JSON.stringify({ errorText: "Unknown command" }),
              id: id,
            })
          );
      }
    });

    connection.on("close", () => {
      console.log(`Client disconnected`);
      const clientIndex = clients.findIndex(
        (client) => client.connection === connection
      );
      if (clientIndex !== -1) {
        clients.splice(clientIndex, 1);
      }
    });
  });
};
