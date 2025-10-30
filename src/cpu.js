import { gameboardManager } from './gameboard.js';

class cpuPlayer {
  constructor() {
    this.gameboard = gameboardManager.createGameboard();
    this.enemyBoard = null;
    this.name = 'CPU';
    this.targetMode = false;
    this.gameboard.randomizeBoard();
    this.enemyBoard = new targetGameboard;
  }

  attackTarget() {
    if (this.targetMode) {
      // Use target ai
    } else {
      // Use hunt ai
    }
  }
}

class targetGameboard {
  constructor() {
    // Create a 10x10 grid to play the game in
    this.grid = Array.from({ length: 10 }, (_, i) =>
      Array.from({ length: 10 }, (_, j) => new targetCell([i, j]))
    );
  }

  getHuntCell() {
    // Get all cells in a pattern if they are not hit:
    const targetCells = new Array();
    for (const gridRow of this.grid) {
      for (const cell of gridRow) {
        const [row, col] = cell.coords;
        if ((row + col) % 2 === 0 && !cell.noHunt()) {
          targetCells.push(cell);
        }
      }
    }
    if (!targetCells.length) {
      // find other cells not yet tried
      for (const gridRow of this.grid) {
        for (const cell of gridRow) {
          if (!cell.attacked) {
            targetCells.push(cell);
          }
        }
      }
    }
    const randomCell = Math.floor(Math.random() * targetCells.length);
    return targetCells[randomCell];
  }
}

// The class for the AI target cell
class targetCell{
  constructor(coords) {
    this.coords = coords;
    this.attacked = false;
    this.ship = false;
    this.potential = false;
    this.possible = true;
  }

  noHunt() {
    return this.attacked || !this.possible;
  }
}

export { cpuPlayer }