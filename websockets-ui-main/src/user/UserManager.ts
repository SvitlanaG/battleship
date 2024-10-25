import { User } from "./User";

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

  public addUser(name: string, password: string): User | string {
    if (this.users.length >= 2) {
      return "User limit reached. Cannot add more users.";
    }

    const newUser = new User(name, password);
    this.users.push(newUser);
    return newUser;
  }

  public getUserById(id: string): User | null {
    return this.users.find((user) => user.id === id) || null;
  }

  public getAllUsers(): User[] {
    return this.users;
  }
}
