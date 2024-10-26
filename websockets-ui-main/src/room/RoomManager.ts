import { UserManager } from "../user/UserManager";
import { Room } from "./Room";

export class RoomManager {
  getGameId() {
    throw new Error("Method not implemented.");
  }
  private static instance: RoomManager;
  private rooms: Map<number, Room> = new Map();
  private nextRoomId: number = 1;

  private constructor() {}

  public static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  public createRoom(index: number): Room {
    const roomId = this.nextRoomId++;
    const room = new Room(roomId);
    const userManager = UserManager.getInstance();
    const user = userManager.getAllUsers()[index];
    room.addUserToRoom(user);
    this.rooms.set(roomId, room);
    console.log(`Room ${roomId} created by user ${user.name}`);
    return room;
  }

  public getRoomById(id: string | number): Room | null {
    return this.rooms.get(Number(id)) || null;
  }

  public getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  public removeRoom(roomId: number): void {
    if (this.rooms.delete(roomId)) {
      console.log(`Room ${roomId} removed.`);
    } else {
      console.log(`Room ${roomId} not found.`);
    }
  }

  public addUserToRoom(roomId: string | number, userIndex: number): boolean {
    const room = this.getRoomById(roomId);
    const userManager = UserManager.getInstance();
    const user = userManager.getAllUsers()[userIndex];

    if (room && user) {
      try {
        room.addUserToRoom(user);
        console.log(`User ${user.name} added to room ${roomId}`);
        return true;
      } catch (error) {
        console.error(error);
      }
    }
    return false;
  }
}
