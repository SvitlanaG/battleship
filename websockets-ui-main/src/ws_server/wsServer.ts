import { WebSocketServer, WebSocket as WebSocketInstance } from "ws";
import { UserManager } from "../user/UserManager";

interface Client {
  connection: WebSocketInstance;
  id: number;
  index: number;
}

interface Message {
  type: string;
  data: {
    name?: string;
    password?: string;
    index?: number | string;
    error?: boolean;
    errorText?: string;
  };
  id: number;
}

const MAX_CLIENTS = 2;

export const startWebSocketServer = (port: number) => {
  const clients: Client[] = [];
  let clientIndexCounter = 0;
  const userManager = UserManager.getInstance();

  const wsServer = new WebSocketServer({ port, clientTracking: true });
  console.log(`WebSocket Server is running on port ${port}!`);

  wsServer.on("connection", (connection: WebSocketInstance) => {
    if (clients.length >= MAX_CLIENTS) {
      connection.send(
        JSON.stringify({
          type: "error",
          data: { errorText: "Maximum number of clients reached" },
          id: 0,
        })
      );
      connection.close();
      return;
    }

    const id = 0;
    const index = clientIndexCounter++;

    clients.push({ connection, id, index });
    console.log(`Client connected with index: ${index} and ID: ${id} `);

    connection.on("message", (message) => {
      let result: Message;

      try {
        result = JSON.parse(message.toString()) as Message;
        console.log(`Received message from client: `, result);
      } catch (error) {
        console.error("Invalid JSON format", error);
        connection.send(
          JSON.stringify({
            type: "error",
            data: { errorText: "Invalid JSON format" },
            id: id,
          })
        );
        return;
      }

      let parsedData;
      try {
        parsedData = JSON.parse(result.data);
      } catch (error) {
        console.error("Invalid data format", error);
        connection.send(
          JSON.stringify({
            type: "error",
            data: { errorText: "Invalid data format" },
            id: id,
          })
        );
        return;
      }

      if (result.type === "reg") {
        const { name, password } = parsedData;

        if (!name || !password) {
          connection.send(
            JSON.stringify({
              type: "reg",
              data: {
                name: name || "",
                index: null,
                error: true,
                errorText: "Name and password are required",
              },
              id: id,
            })
          );
          return;
        }

        const addUserResult = userManager.addUser(name, password);
        console.log("Data users : ", userManager.getAllUsers());

        if (typeof addUserResult === "string") {
          connection.send(
            JSON.stringify({
              type: "reg",
              data: {
                name: name,
                index: null,
                error: true,
                errorText: addUserResult,
              },
              id: id,
            })
          );
        } else {
          const payload: Message = {
            type: "reg",
            data: {
              name: name,
              index: index,
              error: false,
              errorText: "",
            },
            id: id,
          };
          console.log(`Sending payload to client: `, JSON.stringify(payload));
          connection.send(JSON.stringify(payload));
        }
      } else {
        connection.send(
          JSON.stringify({
            type: "error",
            data: { errorText: "Unknown command" },
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
