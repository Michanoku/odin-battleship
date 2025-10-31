import { createGameboard } from './gameboard.js';

class Player {
  constructor(name, ships) {
    this.gameboard = createGameboard(ships);
    this.enemyBoard = null;
    this.name = name;
    this.cpu = false;
  }
}

export { Player }