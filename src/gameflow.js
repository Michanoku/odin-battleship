import "./styles.css";
import { Player } from './players.js';
import { createGameboard, createShipSelection, createStars } from './interface.js';


const game = (function(){

  const players = new Array();

  function addPlayer(name, cpu) {
    players.push(new Player(name, cpu));
    if (players.length === 2) {
      // Start Game
    }
  }
  return { addPlayer }
})();

//const player = new Player("Michanoku");
//player.gameboard.randomizeBoard();
//createGameboard(1, player.gameboard.grid);
createGameboard(1);
createShipSelection();
createStars(1);
createStars(2);

