import { User } from "./User";
import { WebSocket as WebSocketInstance } from "ws";

export class UserManager {
  private static instance: UserManager;
  private users: User[] = [];

  private constructor() {}

  public static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }
    return UserManager.instance;
  }

  public addUser(
    name: string,
    password: string,
    id: number,
    connection: WebSocketInstance
  ): User | string {
    const newUser = new User(name, password, id, connection);
    this.users.push(newUser);
    return newUser;
  }

  public getUserById(id: number): User | null {
    return this.users.find((user) => user.id === id) || null;
  }

  public getAllUsers(): User[] {
    return this.users;
  }
}
