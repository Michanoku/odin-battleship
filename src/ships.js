// The ship class that handles ships on the map
class Ship {
  // The ship only saves it's own health
  constructor(length) {
    this.health = length;
  }

  // On hit, lose one point
  hit() {
    this.health--;
  }

  // Check if ship is sunk, if health is 0, it is sunk
  isSunk() {
    return this.health === 0;
  }
}

export { Ship }