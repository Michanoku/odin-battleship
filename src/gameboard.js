import { Ship } from './ships.js';

const gameboardManager = (function() {

  class Gameboard {
    constructor(ships = null) {
      // Create a 10x10 grid to play the game in
      this.grid = Array.from({ length: 10 }, (_, i) =>
        Array.from({ length: 10 }, (_, j) => new Cell([i, j]))
      );
      // The gameboard initially has 0 ships / sunk ships
      this.ships = 0;
      this.sunkShips = 0;

      // If we passed ships to the board, place them immediately
      if (ships) {
        // If we just passed random, place random ships
        if (ships === 'random') {
          this.randomizeBoard();
        } else {
          // Place each ship in it's location
          for (const ship in ships) {
            const {coord, size, direction} = ships[ship]; 
            this.placeShip(coord, size, direction);
          }
        }
      }
    }

    #getAllCoords(coord, size, direction) {
      // Create an array to house all coordinates
      const allCoords = new Array();
      // Get the start of the ships coordinates and the end
      const [row, col] = coord;
      // Add the first coordinate
      if (direction === 'horizontal') {
        for (let i = 0; i < size; i++) {
          allCoords.push([row, col + i]);
        }
      } else {
        for (let i = 0; i < size; i++) {
          allCoords.push([row + i, col]);
        }
      }
      return allCoords;
    }

    // Get all possible starting locations for a ship of the size
    #getFreeCoords(shipSize) {
      // Create array for coordinates and calculate required space next to cell
      const freeCoords = new Array();
      const required = shipSize - 1;
      // Loop over the board and save all cells that have enough adjacent space
      for (const row of this.grid) {
        for (const cell of row) {
          if (cell.horizontal >= required || cell.vertical >= required) {
            freeCoords.push(cell);
          }
        }
      }
      return freeCoords;
    }

    // Get a direction for the ship to be placed (horizontal or vertical)
    #getDirection(cell, size) {
      // Check the possible directions for a ship of the size on that cell
      const possibleDirections = cell.hasSpace(size);
      // If the length is 1, there is only 1 possible location, return it
      if (possibleDirections.length === 1) {
        return possibleDirections[0];
      } else {
        // Else return one possible location at random
        const random = Math.floor(Math.random() * 2);
        return possibleDirections[random];
      }
    }

    // Select a random coordinate for the ship to be placed
    #selectRandomCoord(size) {
      // Get an array of possible coordinates
      const freeCoords = this.#getFreeCoords(size);
      // Get the amount of coordinates returned and get one of them at random
      const totalCoords = freeCoords.length;
      const randomPosition = Math.floor(Math.random() * totalCoords);
      return freeCoords[randomPosition];
    }

    // Place a ship of a given size on the board at random
    #placeShipRandomly(size) {
      // Select a random coordinate on the board
      const cell = this.#selectRandomCoord(size);
      // Select the direction the ship will have from the coordinate
      const direction = this.#getDirection(cell, size);
      // Get the actual coordinate number array
      const coord = cell.coords;
      // Place the ship at the location in the direction and return it
      const ship = this.placeShip(coord, size, direction);
      return ship;
    }

    // Place a ship on the board at given coordinates and direction
    placeShip(coord, size, direction) {
      // Get the starting coordinates
      const [row, col] = coord;
      // Check if that cell has this much space adjacent
      const space = this.grid[row][col].hasSpace(size);
      // If there is no space or not in the desired location
      if (!space || !space.includes(direction)) {
          return null;
      }
      // Create the ship based on the size
      const newShip = new Ship(size);

      // Set all coordinates that the ship covers to contain the ship
      const allCoords = this.#getAllCoords(coord, size, direction);
      for (const coord of allCoords) {
        const [row, col] = coord;
        this.grid[row][col].ship = newShip;
      }
      this.ships++;
      // If a ship was placed, check and update cells neighbors
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          this.updateCellNeighbors(this.grid[i][j]);
        }
      }
      return newShip;
    }

    receiveAttack(coord) {
      // Get the targetcell of the attack and set attacked to true
      const [row, col] = coord;
      const targetCell = this.grid[row][col];
      targetCell.attacked = true;
      // If there is a ship on the cell, hit it and see if its sunk
      if (targetCell.ship) {
        targetCell.ship.hit();
        if(targetCell.ship.isSunk()) {
          // If it is sunk, add it to sunk ships
          this.sunkShips++;
          // If all ships are sunk, return so
          if (this.sunkShips === this.ships) {
            return {hit: true, allSunk: true};
          }
        }
        // Return the attack was a hit but not all ships are sunk
        return {hit: true, allSunk: false};
      }
      // Returm the attack was not a hit and not all ships are sunk
      return {hit: false, allSunk: false};
    }

    // Update neighbors in case a ship was placed in them
    updateCellNeighbors(cell) {
      // Create two variables to hold the number of free spaces in each direction
      let horizontalSpace = 0;
      let verticalSpace = 0;
      // Get coordinates and calculate new coordinates to check
      const [row, col] = cell.coords;
      for (let i = 1; i < 5; i++) {
        const newCol = col + i;
        if (newCol > 9 || this.grid[row][newCol].ship) {
          break;
        }
        horizontalSpace++;
      };
      for (let i = 1; i < 5; i++) {
        const newRow = row + i;
        if (newRow > 9 || this.grid[newRow][col].ship) {
          break;
        }
        verticalSpace++;
      };
      // Save the new space
      cell.vertical = verticalSpace;
      cell.horizontal = horizontalSpace;
    }

    // Randomize a board of ships
    randomizeBoard() {
      // Place all ships randomly on the map
      const ships = [5, 4, 3, 3, 2]
      for (const ship of ships) {
        this.#placeShipRandomly(ship);
      }
    }

    #simulateRandomShip(size) {
      // Select a random coordinate on the board
      const cell = this.#selectRandomCoord(size);
      // Select the direction the ship will have from the coordinate
      const direction = this.#getDirection(cell, size);
      // Get the actual coordinate number array
      const coord = cell.coords;
      // Place the ship at the location in the direction and return it
      this.placeShip(coord, size, direction);
      return [coord, direction];
    }

    simulateRandomPlacement() {
      // Place all ships randomly on the map
      const shipPlacement = {
        'Leviathan': {coord: [], size: 5, direction: ''},
        'Interceptor': {coord: [], size: 4, direction: ''},
        'Cruiser': {coord: [], size: 3, direction: ''},
        'Destroyer': {coord: [], size: 3, direction: ''},
        'Patrol': {coord: [], size: 2, direction: ''},
      }
      for (const ship in shipPlacement) {
        const size = shipPlacement[ship].size;
        const [coord, direction] = this.#simulateRandomShip(size);
        shipPlacement[ship].coord = coord;
        shipPlacement[ship].direction = direction;
      };
      return shipPlacement;
    }
  }

  // The class for a cell on the board
  class Cell {
    constructor(coords) {
      this.coords = coords;
      this.attacked = false;
      this.ship = null;
      this.horizontal = this.initialize("horizontal", coords);
      this.vertical = this.initialize("vertical", coords);
    }

    // Initialize the cell
    initialize(direction, coords) {
      // Get the coordinates for the cell, and set free space to 0
      let freeSpace = 0;
      const [row, col] = coords;
      // Save a different coordinate based on the direction to check
      const moving = direction === 'horizontal' ? col : row; 
      // The biggest ship is 5, so only need to check for 5 free spaces
      for (let i = 1; i < 5; i++) {
        const newCoord = moving + i;
        // If we go over the edge, stop early (no more free spaces)
        if (newCoord > 9) {
          break;
        }
        freeSpace++;
      }
      return freeSpace;
    }

    // Check if a ship of the size has space from this cell
    hasSpace(shipSize) {
      // The required space includes the cell, so we can subtract 1
      const required = shipSize - 1;
      // Check if horizontal or vertical space is available
      const horizontal = this.horizontal >= required;
      const vertical = this.vertical >= required;
      const available = [];
      // Push available directions
      if (horizontal) {
        available.push('horizontal');
      } 
      if (vertical) {
        available.push('vertical');
      }
      return available;
    }
  }

  function randomPlacement() {
    const mockBoard = new Gameboard();
    const shipPlacement = mockBoard.simulateRandomPlacement(); 
    return shipPlacement
  }
  
  function createGameboard(ships = null) {
    return new Gameboard(ships);
  }
  return { createGameboard, randomPlacement }
})();


export { gameboardManager }