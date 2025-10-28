import { Gameboard } from './gameboard.js';

class Player {
  constructor(name, cpu = false, ships = null) {
    this.gameboard = new Gameboard(ships);
    this.name = name;
    this.cpu = cpu;
  }
}

export { Player }