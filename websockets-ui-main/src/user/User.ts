import { WebSocket as WebSocketInstance } from "ws";
export class User {
  public readonly id: number;
  public name: string;
  public password: string;
  public connection: WebSocketInstance;

  constructor(
    name: string,
    password: string,
    id: number,
    connection: WebSocketInstance
  ) {
    this.name = name;
    this.password = password;
    this.id = id;
    this.connection = connection;
  }
}
