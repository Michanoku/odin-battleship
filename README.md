# odin-battleship
The Odin Project Battleship 

## Overview

WRITE OVERVIEW HERE

## Files

### ships.js

This file handles everything to do with ships.

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

#### Classes

### players.js

#### Classes

### gameflow.js

### interface.js

## Notes

## Thoughts