import "./styles.css";

import { Player } from './players.js';
import { gameboardManager } from './gameboard.js';
import { gameSetup } from './interface.js';


const game = (function(){
  const state = {
    players: new Array(),
  };

  function addPlayer(data) {
    const name = data.name;
    const cpu = data.cpu;
    const ships = data.ships
    state.players.push(new Player(name, cpu, ships));
  }

  function start() {
    // Events that fire from the interface
    waitForPlayers();
    waitForReset();
    waitForRandomPlacement();
    // Initialize the game
    gameSetup.initializeGame();
  }

  // If the player wants to randomize the placement board
  function waitForRandomPlacement() {
    document.addEventListener('randomPlacement', () => {
      // Get random ship placements from the gameboard
      const shipPlacement = gameboardManager.randomPlacement();
      gameSetup.randomizeShips(shipPlacement);
    });
  }

  function waitForReset() {
    document.addEventListener('initialize', () => {
      // Reset all states
      state.players = new Array();
      gameSetup.initializeGame();
    });
  }

  function waitForPlayers() {
    document.addEventListener('playerReady', (event) => {
      addPlayer(event.detail);
      if (state.players.length === 2) {
        // Next Phase
      } else {
        gameSetup.resetBoard();
        gameSetup.setupPlayer2();
      }
    });
  }
  return { start }
})();

//const player = new Player("Michanoku");
//player.gameboard.randomizeBoard();
//createGameboard(1, player.gameboard.grid);
game.start();

