# odin-battleship
The Odin Project Battleship 

## Overview

WRITE OVERVIEW HERE

## Modules

### ships.js

This module handles everything to do with ships.

#### Classes

##### Ship

This is a very simple class representing a players ship on the board.

**Constructor:**

```js
constructor(length) {
  this.health = length;
}
```
 
**Properties:**

- `health`: The health value of the ship, initially considered the same as it's length.

**Key Methods:**

- `hit()`: Reduces the ship's health by 1.
- `isSunk()`: Checks if the ship's health has been reduced to 0 and returns true or false.

### gameboard.js

This module handles the creation of the gameboard and everything that happens to and on the gameboard.

#### Classes

##### Gameboard

The class that handles the gameboard.

**Constructor:**

```js
constructor(ships = null) {
  this.grid = Array.from({ length: 10 }, (_, i) =>
    Array.from({ length: 10 }, (_, j) => new Cell([i, j]))
  );
  this.ships = 0;
  this.sunkShips = 0;

  if (ships) {
    if (ships === 'random') {
      this.randomizeBoard();
    } else {
      for (const ship in ships) {
        const {coord, size, direction} = ships[ship]; 
        this.placeShip(coord, size, direction);
      }
    }
  }
}
```
 
**Properties:**

- `grid`: An array of 10 arrays that hold 10 cells each to form a grid that holds cells.
- `ships`: The amount of ships on the board. 
- `sunkShips`: The amount of ships that have been sunk.

**Key Methods:**

- `placeShip`: Places a ship on the gameboard. Returns the ship  if placed or null if the ship could not be placed.
- `randomizeBoard`: Places all ships in a random location on the board.
- `simulateRandomPlacement`: Simulates a mock gameboard to return possible placements to render in the interface before the user decides their board.
- `receiveAttack`: Receives an attack on the gameboard. Marks the cell as attacked and returns feedback on hit or miss, or if all ships are sunk.

##### Cell

This class handles the information for each cell on the gameboard.

**Constructor:**

```js
constructor(coords) {
  this.coords = coords;
  this.attacked = false;
  this.ship = null;
  this.horizontal = this.initialize("horizontal", coords);
  this.vertical = this.initialize("vertical", coords);
}
```
 
**Properties:**

- `coords`: The coordinate array for the cell. For example: [0, 0]
- `attacked`: A boolean to show whether the cell has been attacked or not.
- `ship`: A reference to the ship object that partly occupies the cell. Null if no ship is present.
- `horizontal`: The number of free cells to the right of this cell.
- `vertical`: The number of free cells to the bottom of this cell.

**Key Methods:**

- `initialize`: Calculates the horizontal and vertical free space on cell creation. Since the grid size is 0 - 9, any cell near the right or bottom edges have less space from the start.
- `hasSpace`: Takes the ship size as argument and checks if there is free space in any direction. Returns all directions with free space or an empty array if no space is available.

#### Module Functions

- `createGameboard`: Creates and returns a new gameboard with optional placed ships.
- `randomPlacement`: Creates a mock gameboard and simulates random placement of ships to return to the interface for the user to consider.

### players.js

#### Classes

**Constructor:**

```js
constructor() {

}
```
 
**Properties:**

- `name()`: description.

**Key Methods:**

- `name()`: description.


### gameflow.js

### interface.js

## Notes

## Thoughts