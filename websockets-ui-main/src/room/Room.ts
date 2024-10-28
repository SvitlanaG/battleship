import { User } from "../user/User";
import { MessageType, Ship, AttackStatus, CellStatus } from "../types/types";
import { handleAttack } from "../handlers/handleAttack";

export class Room {
  public readonly roomId: number;
  private users: User[] = [];
  private ships: Map<number, Ship[]> = new Map();
  private gameState: string | null = null;
  private gameId: number;
  private currentPlayer: User | null = null;
  private isGameStarted: boolean = false;
  private winnerTable: Map<User, number> = new Map();
  private playerBoards: Map<number, AttackStatus[][]> = new Map();

  constructor(roomId: number) {
    this.roomId = roomId;
    this.gameId = this.generateGameId();
  }

  private generateGameId(): number {
    return Date.now() + this.roomId;
  }

  public getUsers(): User[] {
    return this.users;
  }

  public getGameId(): number {
    return this.gameId;
  }

  public addUserToRoom(user: User): void {
    if (this.isGameStarted) {
      console.error("Cannot add user. The game has already started.");
    }
    if (this.users.length >= 2) {
      console.error("Room is full. Cannot add more users.");
    }
    if (!this.users.includes(user)) {
      this.users.push(user);
    }
  }

  public startGame(): void {
    if (this.users.length < 2) {
      console.error("Cannot start the game, not enough players.");
    }
    this.isGameStarted = true;
    this.gameState = "in_progress";
    this.currentPlayer = this.users[0];
    this.broadcastTurn();
    console.log(`Players: ${this.users.map((user) => user.name).join(", ")}`);
    console.log(`Current player set to: ${this.currentPlayer?.name}`);
  }

  public finishGame(): void {
    this.isGameStarted = false;
    this.gameState = null;
    this.currentPlayer = null;
    console.log(`Game finished in room ${this.roomId}`);
  }

  public updateTurn(): void {
    if (!this.isGameStarted) {
      console.error("Cannot update turn. The game has not started.");
      return;
    }
    const currentIndex = this.users.indexOf(this.currentPlayer as User);
    const nextIndex = currentIndex === 0 ? 1 : 0;
    this.currentPlayer = this.users[nextIndex];
    this.broadcastTurn();
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

  public addShipsForPlayer(playerIndex: number, ships: Ship[]): void {
    const boardSize = 10;
    const playerBoard: CellStatus[][] = Array.from({ length: boardSize }, () =>
      Array(boardSize).fill("empty")
    );

    ships.forEach((ship) => {
      const { x, y } = ship.position;
      const { direction, length } = ship;

      for (let i = 0; i < length; i++) {
        const posX = direction ? x + i : x;
        const posY = direction ? y : y + i;

        if (posX < boardSize && posY < boardSize) {
          playerBoard[posY][posX] = "ship";
        } else {
          console.error(
            `Invalid ship position for ship at (${x}, ${y}) with length ${length}`
          );
        }
      }
    });
    this.playerBoards.set(playerIndex, playerBoard);
    this.ships.set(playerIndex, ships);
  }

  public getShipsForPlayer(playerIndex: number): Ship[] | undefined {
    return this.ships.get(playerIndex);
  }

  public areAllShipsPlaced(): boolean {
    return this.ships.size === this.users.length;
  }

  private broadcastTurn(): void {
    const turnMessage = JSON.stringify({
      type: MessageType.Turn,
      data: {
        currentPlayer: this.currentPlayer?.id,
      },
      id: 0,
    });

    this.users.forEach((user) => {
      user.connection.send(turnMessage);
    });
  }

  public handleAttack(x: number, y: number, attackingPlayerId: number): void {
    const attackingPlayer = this.users.find(
      (user) => user.id === attackingPlayerId
    );
    if (!attackingPlayer) {
      console.error("Attacking player not found.");
      return;
    }

    handleAttack(this, x, y, attackingPlayer);
  }

  public getOpposingPlayer(attackingPlayerId: number): User | null {
    return this.users.find((user) => user.id !== attackingPlayerId) || null;
  }

  public getPlayerBoard(playerId: number): AttackStatus[][] | undefined {
    return this.playerBoards.get(playerId);
  }

  public broadcastAttackFeedback(
    x: number,
    y: number,
    status: AttackStatus,
    attackingPlayerId: number
  ): void {
    const feedbackMessage = JSON.stringify({
      type: MessageType.Attack,
      data: {
        position: { x, y },
        currentPlayer: attackingPlayerId,
        status,
      },
      id: 0,
    });

    this.users.forEach((user) => user.connection.send(feedbackMessage));
  }
}
