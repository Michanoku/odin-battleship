import "./styles.css";
import { Player } from './players.js';
import { createGameboard } from './interface.js';


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

createGameboard(1);
createGameboard(2);