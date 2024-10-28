import { WebSocket as WebSocketInstance } from "ws";
import { UserManager } from "../user/UserManager";
import { MessageType, ParsedUserData } from "../types/types";

export default function handlePlayerRegistration(
  parsedData: ParsedUserData,
  connection: WebSocketInstance,
  id: number,
  index: number
) {
  const { name, password } = parsedData;
  const userManager = UserManager.getInstance();

  if (!name || !password) {
    connection.send(
      JSON.stringify({
        type: MessageType.Reg,
        data: JSON.stringify({
          name: name || "",
          index: null,
          error: true,
          errorText: "Name and password are required",
        }),
        id: id,
      })
    );
    return;
  }

  const addUserResult = userManager.addUser(name, password, index, connection);

  if (typeof addUserResult === "string") {
    connection.send(
      JSON.stringify({
        type: MessageType.Reg,
        data: JSON.stringify({
          name: name,
          index: null,
          error: true,
          errorText: addUserResult,
        }),
        id: id,
      })
    );
  } else {
    connection.send(
      JSON.stringify({
        type: MessageType.Reg,
        data: JSON.stringify({
          name: name,
          index: index,
          error: false,
          errorText: "",
        }),
        id: id,
      })
    );
  }
}
