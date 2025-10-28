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

  function waitForPlayers() {
    document.addEventListener('playerReady', (event) => {
      state.players.push(event.detail);
      if (state.players.length === 2) {
        console.log('Both players ready! Starting game...');
        // startGame(players);
      }
    });
  }
  return { addPlayer }
})();

//const player = new Player("Michanoku");
//player.gameboard.randomizeBoard();
//createGameboard(1, player.gameboard.grid);
gameSetup.initializeGame();
createStars(1);
createStars(2);

