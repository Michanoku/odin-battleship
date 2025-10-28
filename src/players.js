import { gameboardManager } from './gameboard.js';

class Player {
  constructor(name, cpu, ships) {
    this.gameboard = gameboardManager.createGameboard(ships);
    this.enemyBoard = null;
    this.name = name;
    this.cpu = cpu;

    // If the player is a CPU, randomize their board and make an empty board
    if (cpu) {
      this.gameboard.randomizeBoard();
      this.enemyBoard = gameboardManager.createGameboard();
    }
  }
  // Add CPU moves here, use enemyboard to find the enemy ships
}

export { Player }