import { Room } from "../room/Room";
import { User } from "../user/User";
import { AttackStatus, CellStatus, Position } from "../types/types";

export function handleAttack(
  room: Room,
  x: number,
  y: number,
  attackingPlayer: User
): void {
  const targetPlayer = room.getOpposingPlayer(attackingPlayer.id);
  if (!targetPlayer) {
    console.error("Target player not found.");
    return;
  }

  const board = room.getPlayerBoard(targetPlayer.id);
  if (!board) {
    console.error("Target player's board not found.");
    return;
  }

  let status: AttackStatus = "miss";
  if (board[y][x] === "ship") {
    board[y][x] = "hit";
    status = isShipSunk(board, { x, y }) ? "killed" : "shot";

    if (status === "killed") {
      markSurroundingMisses(board, { x, y });
    }
  } else {
    board[y][x] = "miss";
  }

  room.broadcastAttackFeedback(x, y, status, attackingPlayer.id);
  if (status !== "miss") {
    room.updateTurn();
  }
}

function isShipSunk(board: CellStatus[][], position: Position): boolean {
  const shipCells = findConnectedShipCells(board, position);
  return shipCells.every((cell) => board[cell.y][cell.x] === "hit");
}

function findConnectedShipCells(
  board: CellStatus[][],
  start: Position
): Position[] {
  const directions = [
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: 0 },
  ];
  const shipCells: Position[] = [];
  const stack: Position[] = [start];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const { x, y } = stack.pop()!;
    if (visited.has(`${x},${y}`)) continue;
    visited.add(`${x},${y}`);
    shipCells.push({ x, y });

    for (const dir of directions) {
      const nx = x + dir.x;
      const ny = y + dir.y;
      if (isWithinBounds(nx, ny, board) && board[ny][nx] === "ship") {
        stack.push({ x: nx, y: ny });
      }
    }
  }

  return shipCells;
}

function markSurroundingMisses(
  board: CellStatus[][],
  position: Position
): void {
  const shipCells = findConnectedShipCells(board, position);
  const surroundingCells = new Set<string>();

  shipCells.forEach((cell) => {
    getSurroundingCells(cell).forEach((surroundingCell) => {
      if (
        isWithinBounds(surroundingCell.x, surroundingCell.y, board) &&
        board[surroundingCell.y][surroundingCell.x] === "empty"
      ) {
        surroundingCells.add(`${surroundingCell.x},${surroundingCell.y}`);
      }
    });
  });

  surroundingCells.forEach((cell) => {
    const [x, y] = cell.split(",").map(Number);
    board[y][x] = "miss";
  });
}

function getSurroundingCells(position: Position): Position[] {
  const deltas = [
    { x: -1, y: -1 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ];
  return deltas.map((delta) => ({
    x: position.x + delta.x,
    y: position.y + delta.y,
  }));
}

function isWithinBounds(x: number, y: number, board: CellStatus[][]): boolean {
  return y >= 0 && y < board.length && x >= 0 && x < board[y].length;
}
