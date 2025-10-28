import "./styles.css";
import { Player } from './players.js';
import { createGameboard, createStars, gameSetup } from './interface.js';


const game = (function(){
  const state = {
    players: new Array(),
  };

  function addPlayer(data) {
    const name = data.name;
    const cpu = data.cup;
    const ships = data.ships
    state.players.push(new Player(name, cpu, ships));
  }

  function start() {
    gameSetup.initializeGame();
    waitForPlayers();
    // Need to be replaced later
    createStars(1);
    createStars(2);
  }

  function waitForPlayers() {
    document.addEventListener('playerReady', (event) => {
      addPlayer(event.detail);
      if (state.players.length === 2) {
        // Next Phase
      } else {
        gameSetup.resetBoard();
      }
    });
  }
  return { start }
})();

//const player = new Player("Michanoku");
//player.gameboard.randomizeBoard();
//createGameboard(1, player.gameboard.grid);
game.start();

