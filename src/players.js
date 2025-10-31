import { gameboardManager } from './gameboard.js';

class Player {
  constructor(name, ships) {
    this.gameboard = gameboardManager.createGameboard(ships);
    this.enemyBoard = null;
    this.name = name;
    this.cpu = false;
  }
}

export { Player }