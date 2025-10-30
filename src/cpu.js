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
  beginTargetMode(hitCoords) {
    this.targetMode = true;
    this.targetShip = {
      coords: [hitCoords],
      suspectedDirection: '',
      branch: false,
      branchPoint: [],
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

  getAttackResults(result, coords) {
    // Tell gameboard to mark the cell as attacked and possibly hit
    this.targetBoard.markAttack(coords, result.hit);
    // If ship was found, and we are not in target mode, go into target mode
    if (result.hit) {
      if (!this.targetMode) {
        this.beginTargetMode(coords);
      }
      if (this.targetShip.branched) {
        this.targetShip.branchPoint = coords;
      }
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
        this.checkCell(cell);
      }
    }
  }

  analyzeTarget() {
    // sort coordinate array (by changing coordinate)
    const hits = this.targetShip.coords.length;
    if (hits > 1) {
      if (!this.targetShip.direction) {
        const firstRow = this.targetShip.coords[0][0];
        const secondRow = this.targetShip.coords[1][0];
        this.targetShip.direction = firstRow === secondRow ? 'horizontal' : 'vertical';
      }
      this.targetShip.coords.sort((row, col) => {
        // Sort by row first
        if (row[0] !== col[0]) return row[0] - col[0];
        // If row is the same, sort by col
        return row[1] - col[1];
      });
    };
    this.targetBoard.markPotential(this.targetShip);
  }

  markPotential(targetShip) {
    // If we have a direction, proceed along
    if (targetShip.direction) {
      if (targetShip.branchPoint) {
        const branch = this.findBranch(targetShip.coords, targetShip.branchPoint);
        this.targetShip = {
          coords: [targetShip.branchPoint, branch],
          suspectedDirection: '',
          branch: false,
          branchPoint: [],
        };
        this.analyzeTarget();
      }
      // Add a safety check
      let added = false;
      // Find the direction that we are not looking for now
      const otherDirection = targetShip.direction === 'horizontal' ? 'vertical' : 'horizontal';
      // Check each cell in the target ship
      targetShip.coords.forEach(coord => {
        const [row, col] = coord;
        const targetCell = this.grid[row][col];
        // Remove the potential hits for non directional cells
        const removePotential = this.getSurrounding(targetCell, otherDirection);
        removePotential.forEach(cell => {
          cell.potential = false;
        });
        // Add cells that have not been hit but are in direction
        const addPotential = this.getSurrounding(targetCell, targetShip.direction);
        addPotential.forEach(cell => {
          if (!cell.attacked) {
            cell.potential = true;
            added = true;
          }
        });
      });
      if (targetShip.coords.length > 5 && !added) {
        const [firstRow, firstCol] = targetShip.coords[0];
        const [lastRow, lastCol] = targetShip.coords[targetShip.coords.length-1];
        const firstCell = this.grid[firstRow][firstCol];
        const lastCell = this.grid[lastRow][lastCol];
        const addFirstPotential = this.getSurrounding(firstCell, otherDirection);
        const addSecondPotential = this.getSurrounding(lastCell, otherDirection);
        addFirstPotential.concat(addSecondPotential).forEach(cell => {
          if (!cell.attacked) {
            cell.potential = true;
          };
        });
        targetShip.branch = true;
      }
    } else {
      const [row, col] = targetShip.coords[0];
      const targetCell = this.grid[row][col];
      const surroundingCells = this.getSurrounding(targetCell);
      surroundingCells.forEach(cell => {
        if (!cell.attacked) {
          cell.potential = true;
        }
      });
    }
  }

  findBranch(coords, branchPoint) {  
    const [branchRow, branchCol] = branchPoint;
    return coords.find(([row, col]) =>
      row === branchRow || col === branchCol
    );
  }

  // Get possible cells surrounding this cell
  getSurrounding(cell, direction = null) {
    const [baseRow, baseCol] = cell.coords;
    const calculations = new Array();
    if (direction === 'horizontal' || direction === null) {
      calculations.push([0, -1]);
      calculations.push([0, 1]);
    } 
    if (direction === 'vertical' || direction === null) {
      calculations.push([-1, 0]);
      calculations.push([1, 0]);
    }
    const checkArray = new Array();
    calculations.forEach(coord => {
      const [row, col] = coord;
      const newRow = baseRow + row;
      const newCol = baseCol + col;
      if (newRow >= 0 && newRow <= 9 && newCol >= 0 && newCol <= 9) {
        checkArray.push(this.grid[newRow][newCol]);
      }
    });
    return checkArray;
  }

  markAttack(coords, hit) {
    const [row, col] = coords;
    const cell = this.grid[row][col];
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