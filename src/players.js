import { createGameboard } from './gameboard.js';

class Player {
  constructor(name, ships) {
    this.gameboard = createGameboard(ships);
    this.name = name;
  }
}

export { Player }