// src/server.ts
import { httpServer } from "./src/http_server/index.js";
import { startWebSocketServer } from "./src/ws_server/wsServer";

const HTTP_PORT = 8181;
const WS_PORT = 3000;
console.log(`Start static HTTP server on port ${HTTP_PORT}!`);
httpServer.listen(HTTP_PORT);
startWebSocketServer(WS_PORT);
