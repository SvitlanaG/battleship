import { httpServer } from "./src/http_server/index.js";
import { WebSocketServer } from "ws";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const clients = [];
let clientId = 0;

const wsServer = new WebSocketServer({ port: 3000, clientTracking: true });

wsServer.on("connection", (connection) => {
  const id = clientId++;
  clients.push({ connection, id });
  console.log(`Client connected with id: ${id}`);

  connection.on("message", (message) => {
    let result;

    try {
      result = JSON.parse(message.toString());
      console.log(`Received message from client ${id}: `, result);
    } catch (error) {
      console.error("Invalid JSON format", error);
      connection.send(
        JSON.stringify({
          type: "error",
          data: { errorText: "Invalid JSON format" },
        })
      );
      return;
    }

    if (result.type === "reg") {
      const { name, password } = result.data;

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
            id,
          })
        );
        return;
      }

      const payLoad = {
        type: "reg",
        data: {
          name: name,
          index: id,
          error: false,
          errorText: "",
        },
        id,
      };

      connection.send(JSON.stringify(payLoad));
    } else {
      connection.send(
        JSON.stringify({
          type: "error",
          data: { errorText: "Unknown command" },
          id,
        })
      );
    }
  });

  connection.on("close", () => {
    console.log(`Client ${id} disconnected`);
    const clientIndex = clients.findIndex((client) => client.id === id);
    if (clientIndex !== -1) {
      clients.splice(clientIndex, 1);
    }
  });
});

console.log(`WebSocket Server is running on port ${HTTP_PORT}`);
