import { gameboardManager } from './gameboard.js';

class cpuPlayer {
  constructor() {
    this.name = 'CPU';
    this.cpu = true;
    this.targetMode = false;
    this.targetShip = {};
    this.gameboard = gameboardManager.createGameboard();
    this.gameboard.randomizeBoard();
    this.targetBoard = new targetGameboard;
  }

  // Attacks a cell
  attackCell() {
    if (this.targetMode) {
      // Analyze the target, then pick a new cell to attack
      this.#analyzeTarget();
      const targetCell = this.targetBoard.getTargetCell();
      // If there is no good cell, return to hunt mode
      if (!targetCell) {
        this.#endTargetMode();
        return this.attackCell();
      }
      return targetCell.coords;
    } else {
      // Get a target cell to try
      const huntCell = this.targetBoard.getHuntCell();
      return huntCell.coords;
    }
  }

  #analyzeTarget() {
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
    this.#markPotential();
  }

  #markPotential() {
    // If we have a direction, proceed along
    if (this.targetShip.direction) {
      // If a branchpoint was detected, reset coordinates to follow along the branch
      if (this.targetShip.branchPoint) {
        // Find the branching coordinate from the branchpoint
        const branch = this.#findBranch(this.targetShip.coords, this.targetShip.branchPoint);
        const branchPoint = this.targetShip.branchPoint;
        this.targetShip = {
          coords: [branchPoint, branch],
          suspectedDirection: '',
          branch: false,
          branchPoint: null,
        };
        // Analyze target with the new data 
        this.#analyzeTarget();
      }
      // Add a safety check, in case nothing is found
      let added = 0;
      // Find the direction that we are not looking for now
      const otherDirection = this.targetShip.direction === 'horizontal' ? 'vertical' : 'horizontal';
      // Check each cell in the target ship
      this.targetShip.coords.forEach(coord => {
        // Remove the potential hits for non directional cells
        this.targetBoard.removePotential(coord, otherDirection);
        // Add cells that have not been hit but are in direction
        added += this.targetBoard.addPotential(coord, this.targetShip.direction);
      });
      // If ship length invalid and nothing has been added, find adjacent ship
      if (this.targetShip.coords.length > 5 && !added) {
        const start = this.targetShip.coords[0];
        const end = this.targetShip.coords[this.targetShip.coords.length-1];
        // Check the edges of the current target for potential targets
        this.targetBoard.checkEdgePotential(start, end, otherDirection);
        // Mark the targetShip as branched
        this.targetShip.branch = true;
      }
    } else {
      // If there is no direction, we are dealing with single cell target
      const coords = this.targetShip.coords[0];
      this.targetBoard.markSingle(coords)
    }
  }

  // Begins target mode after a ship has been found
  #beginTargetMode(hitCoords) {
    this.targetMode = true;
    this.targetShip = {
      coords: [hitCoords],
      suspectedDirection: '',
      branch: false,
      branchPoint: null,
    };
  }

  // Ends target mode after all options are exhausted
  #endTargetMode() {
    this.targetMode = false;
    this.targetShip = {};
  }

  // Find the branching connection between the coordinates and branchpoint (but not the branchpoint itself)
  #findBranch(coords, branchPoint) {  
    const [branchRow, branchCol] = branchPoint;
    return coords.find(([row, col]) =>
      (row === branchRow || col === branchCol) &&
      !(row === branchRow && col === branchCol)
    );
  }

  getAttackResults(result, coords) {
    // Tell gameboard to mark the cell as attacked and possibly hit
    this.targetBoard.markAttack(coords, result.hit);
    // If ship was found, and we are not in target mode, go into target mode
    if (result.hit) {
      if (!this.targetMode) {
        this.#beginTargetMode(coords);
      } else {
        this.targetShip.coords.push(coords);
      }
      if (this.targetShip.branch) {
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

  // Check all cells of the map to see if any are now invalid targets
  updateMap() {
    for (const gridRow of this.grid) {
      for (const cell of gridRow) {
        this.#checkCell(cell);
      }
    }
  }
 
  #checkCell(targetCell) {
    // Get all surrounding cells
    const surroundingCells = this.#getSurrounding(targetCell.coords);
    // Mark the cell as impossible if all surrounding cells have been attacked and there was no ship
    targetCell.possible = !surroundingCells.every(cell => cell.attacked && !cell.ship);
  }

  // Remove the potential targets along the direction
  removePotential(coords, direction) {
    const coordArray = this.#getSurrounding(coords, direction);
    coordArray.forEach(cell => {
      cell.potential = false;
    });
  }

  // Add the potential targets along the direction
  addPotential(coords, direction) {
    let added = 0;
    const coordArray = this.#getSurrounding(coords, direction);
    coordArray.forEach(cell => {
      if (!cell.attacked) {
        cell.potential = true;
        added++;
      }
    });
    return added;
  }

  // Check the potential targets on the edges
  checkEdgePotential(start, end, direction) {
    const addFirstPotential = this.#getSurrounding(start, direction);
    const addSecondPotential = this.#getSurrounding(end, direction);
    addFirstPotential.concat(addSecondPotential).forEach(cell => {
      if (!cell.attacked) {
        cell.potential = true;
      };
    });
  }

  // Check potential for a single cell
  markSingle(coords) {
    const surroundingCells = this.#getSurrounding(coords);
    surroundingCells.forEach(cell => {
      if (!cell.attacked) {
        cell.potential = true;
      }
    });
  }

  // Get possible cells surrounding this cell
  #getSurrounding(baseCoords, direction = null) {
    const [baseRow, baseCol] = baseCoords;
    const calculations = new Array();
    // Add needed calculations for horizontal, vertical or both
    if (direction === 'horizontal' || direction === null) {
      calculations.push([0, -1]);
      calculations.push([0, 1]);
    } 
    if (direction === 'vertical' || direction === null) {
      calculations.push([-1, 0]);
      calculations.push([1, 0]);
    }
    // Calculate the array of coordinates to check, add only if they are valid
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

  // Mark a cell as attacked. If there is a hit, mark it, potential is now false
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
    // Pick a random cell from the array
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
    // Pick a random cell from the array
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