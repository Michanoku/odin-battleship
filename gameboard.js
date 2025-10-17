import { Ship } from './ships.js';

/* Consideration for the gameboard logic

Grid is 10x10 -> Use Array of arrays
When a ship is placed: All spaces must be free of other ships
spaces must have at least two values, ship (if any) and if the field was hit or not
Means: Check the required spaces, and if they are free, create the ship 
of the required length and save reference to the object in all of the spaces

receiveAttack function (get coordinates (x, y) checks if ship is there, 
sends hit function, returns either hit or miss)
function to mark hit or miss (maybe squares with both ship and hit marker will determine)
keep track of number of ships on the board and whether or not they have been sunk

In the interface, we only need 2 gameboards, but they need to show different information to the player.
(which we can maybe leave to the dom, we'll see)
*/

class Gameboard {
  constructor() {
    this.grid = Array.from({length: 10}, () =>
      Array.from({length: 10}, () => ({status: null, ship: null}))
    );
  }

  placeShip(coordArray) {
    // Check if the coordinates are empty (no ships are present)
    const isEmpty = (coord) => {
      return this.grid[coord[0]][coord[1]].ship === null;
    }
    if (coordArray.every(isEmpty)) {
      // Create the ship based on the length of the coord array
      const newShip = new Ship(coordArray.length);
      for (const coord of coordArray) {
        this.grid[coord[0]][coord[1]].ship = newShip;
      }
      return newShip;
    }
    return null;
  }

}

export { Gameboard }