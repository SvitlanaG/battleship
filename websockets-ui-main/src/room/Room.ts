import { User } from "../user/User";

export class Room {
  public readonly roomId: number;
  private users: User[] = [];
  private gameState: string | null = null;
  private currentPlayer: User | null = null;
  private isGameStarted: boolean = false;
  private winnerTable: Map<User, number> = new Map();

  constructor(roomId: number) {
    this.roomId = roomId;
  }

  public getUsers(): User[] {
    return this.users;
  }

  public addUserToRoom(user: User): void {
    if (this.isGameStarted) {
      throw new Error("Cannot add user. The game has already started.");
    }
    if (this.users.length >= 2) {
      throw new Error("Room is full. Cannot add more users.");
    }
    if (!this.users.includes(user)) {
      this.users.push(user);
      console.log(`User ${user.name} added to room ${this.roomId}`);
    }
  }

  public startGame(): void {
    if (this.users.length < 2) {
      throw new Error("Cannot start the game, not enough players.");
    }
    this.isGameStarted = true;
    this.gameState = "in_progress";
    this.currentPlayer = this.users[0];
    console.log(`Game started in room ${this.roomId}`);
  }

  public finishGame(): void {
    this.isGameStarted = false;
    this.gameState = null;
    this.currentPlayer = null;
    console.log(`Game finished in room ${this.roomId}`);
  }

  public updateGameState(newState: string): void {
    if (!this.isGameStarted) {
      throw new Error("Cannot update game state. The game has not started.");
    }
    this.gameState = newState;
    console.log(`Game state updated in room ${this.roomId}`);
  }

  public updateTurn(): void {
    if (!this.isGameStarted) {
      throw new Error("Cannot update turn. The game has not started.");
    }
    const currentIndex = this.users.indexOf(this.currentPlayer as User);
    const nextIndex = (currentIndex + 1) % this.users.length;
    this.currentPlayer = this.users[nextIndex];
    console.log(
      `It's now ${this.currentPlayer?.name}'s turn in room ${this.roomId}`
    );
  }

  public updateWinner(user: User): void {
    const wins = this.winnerTable.get(user) || 0;
    this.winnerTable.set(user, wins + 1);
    console.log(`${user.name} won a game in room ${this.roomId}`);
  }

  public getRoomState() {
    return {
      roomId: this.roomId,
      users: this.users.map((u) => u.name),
      gameState: this.gameState,
      currentPlayer: this.currentPlayer?.name,
      winnerTable: Array.from(this.winnerTable.entries()).map(
        ([user, wins]) => ({ name: user.name, wins })
      ),
    };
  }
}
