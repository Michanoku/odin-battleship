import { gameboardManager } from './gameboard.js';

class cpuPlayer {
  constructor() {
    this.gameboard = gameboardManager.createGameboard();
    this.enemyBoard = new targetGameboard;
    this.name = 'CPU';
    this.targetMode = false;
    this.targetShip = {};
    this.gameboard.randomizeBoard();
  }

  beginTargetMode(coords) {
    this.targetMode = true;
    this.targetShip = {
      coords: [coords],
      suspectedDirection: '',
      hits: 1,
    };
  }

  endTargetMode() {
    this.targetMode = false;
    this.targetShip = {};
  }

  attackTarget() {
    if (this.targetMode) {
      // Use target ai
      this.analyzeTarget();
      const targetCell = this.enemyBoard.getTargetCell();
      if (!targetCell) {
        this.endTargetMode();
        this.attackTarget();
      }
    } else {
      // Use hunt ai
      const targetCell = this.enemyBoard.getHuntCell();
      return targetCell.coords;
    }
  }

  analyzeTarget() {
    // sort coordinate array (by changing coordinate)
    // For all cells of the ship hit so far, check possible locations to hit
    // If hit is 1 we are at single cell, mark all adjacent non attacked cells as potential
    // if hit is 2, calculate direction, mark non directional adjacent non attacked cells as potential false, 
    // mark direction cells as potential (if they are possible)
    // if hit is > 2 mark direction cells as potential 
    // if hit is > 5 then we definitely have adjacent ships, mark start and end coordinates of the
    // non direction as potential if they are not yet attacked
  }

  markCell(result, coords) {
    // Get the result from the gameflow and mark the cell attacked and ship or not
    const [row, col] = coords;
    const cell = this.enemyBoard.grid[row][col];
    cell.attacked = true;
    // If ship was found, and we are not in target mode, go into target mode
    if (result.hit) {
      cell.ship = true;
      if (!this.targetMode) {
        this.beginTargetMode;
      }
    }
    this.updateMap();
  }

  updateMap() {
    for (const gridRow of this.enemyBoard.grid) {
      for (const cell of gridRow) {
        this.enemyBoard.checkCell(cell);
      }
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
    // Get all cells in a pattern if they are not hit or marked impossible
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

  checkSurroundings() { 
  }

  
  checkCell(targetCell) {
    // Get all surrounding cells
    const surroundingCells = this.getSurrounding(targetCell);
    // Mark the cell as impossible if all surrounding cells have been attacked and there was no ship
    targetCell.possible = !surroundingCells.every(cell => cell.attacked && !cell.ship);
  }

  // Get possible cells surrounding this cell
  getSurrounding(cell) {
    const [baseRow, baseCol] = cell.coords;
    const calculations = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const checkArray = new Array();
    calculations.forEach(coord => {
      const [row, col] = coord;
      const newRow = baseRow + row;
      const newCol = baseCol + col;
      if (newRow > 0 && newRow < 9 && newCol > 0 && newCol < 9) {
        checkArray.push(this.grid[newRow][newCol]);
      }
    });
    return checkArray;
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