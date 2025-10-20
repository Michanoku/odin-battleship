import { Gameboard } from './gameboard.js';

class Player {
  constructor(name, cpu = false) {
    this.gameboard = new Gameboard();
    this.name = name;
    this.cpu = cpu;
  }
}

export { Player }