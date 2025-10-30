import { gameboardManager } from './gameboard.js';

class cpuPlayer {
  constructor() {
    this.name = 'CPU';
    this.targetMode = false;
    this.targetShip = {};
    this.gameboard = gameboardManager.createGameboard();
    this.gameboard.randomizeBoard();
    this.targetBoard = new targetGameboard;
  }

  // Begins target mode after a ship has been found
  beginTargetMode(coords) {
    this.targetMode = true;
    this.targetShip = {
      coords: [coords],
      suspectedDirection: '',
    };
  }

  // Ends target mode after all options are exhausted
  endTargetMode() {
    this.targetMode = false;
    this.targetShip = {};
  }

  // Attacks a cell
  attackCell() {
    if (this.targetMode) {
      // Analyze the target, then pick a new cell to attack
      this.analyzeTarget();
      const targetCell = this.targetBoard.getTargetCell();
      // If there is no good cell, return to hunt mode
      if (!targetCell) {
        this.endTargetMode();
        return this.attackCell();
      }
      return targetCell.coords;
    } else {
      // Get a target cell to try
      const huntCell = this.targetBoard.getHuntCell();
      return huntCell.coords;
    }
  }

  analyzeTarget() {
    // sort coordinate array (by changing coordinate)
    const hits = this.targetShip.coords.length;
    if (hits > 1) {
      // TO DO SORT
    };
    if (hits === 1) {

    } else if (hits === 2) {
      
    } else if (hits <= 5) {

    } else {
      
    }
    // For all cells of the ship hit so far, check possible locations to hit
    // If hit is 1 we are at single cell, mark all adjacent non attacked cells as potential
    // if hit is 2, calculate direction, mark non directional adjacent non attacked cells as potential false, 
    // mark direction cells as potential (if they are possible)
    // if hit is > 2 mark direction cells as potential 
    // if hit is > 5 then we definitely have adjacent ships, mark start and end coordinates of the
    // non direction as potential if they are not yet attacked
  }

  getAttackResults(result, coords) {
    // Tell gameboard to mark the cell as attacked and possibly hit
    this.targetBoard.markAttack(coords, result.hit);
    // If ship was found, and we are not in target mode, go into target mode
    if (result.hit && !this.targetMode) {
      this.beginTargetMode();
    }
    this.targetBoard.updateMap();
  }

}

class targetGameboard {
  constructor() {
    // Create a 10x10 grid to play the game in
    this.grid = Array.from({ length: 10 }, (_, i) =>
      Array.from({ length: 10 }, (_, j) => new targetCell([i, j]))
    );
  }

  updateMap() {
    for (const gridRow of this.grid) {
      for (const cell of gridRow) {
        this.targetBoard.checkCell(cell);
      }
    }
  }

  markAttack(coords, hit) {
    const [row, col] = coords;
    const cell = this.targetBoard.grid[row][col];
    cell.attacked = true;
    cell.ship = hit;
    cell.potential = false;
  }

  getHuntCell() {
    // Get all cells in a pattern if they are not hit or marked impossible
    const huntCells = new Array();
    for (const gridRow of this.grid) {
      for (const cell of gridRow) {
        const [row, col] = cell.coords;
        if ((row + col) % 2 === 0 && !cell.noHunt()) {
          huntCells.push(cell);
        }
      }
    }
    if (!huntCells.length) {
      // find other cells not yet tried
      for (const gridRow of this.grid) {
        for (const cell of gridRow) {
          if (!cell.attacked) {
           huntCells.push(cell);
          }
        }
      }
    }
    const randomCell = Math.floor(Math.random() * huntCells.length);
    return huntCells[randomCell];
  }

  // Get a cell marked as potential target
  getTargetCell() {
    const targetCells = new Array();
    for (const gridRow of this.grid) {
      for (const cell of gridRow) {
        if (cell.potential) {
          targetCells.push(cell);
        }
      }
    }
    // If no potential targets remain return null
    if (!targetCells.length) {
      return null;
    }
    const randomCell = Math.floor(Math.random() * targetCells.length);
    return targetCells[randomCell];
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