import "./styles.css";
import { Player } from './players.js';
import { createGameboard, createStars } from './interface.js';


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

const player = new Player("Michanoku");
console.log(player.gameboard)
player.gameboard.randomize();
console.log(player.gameboard)
createGameboard(1, player.gameboard.grid);
createGameboard(2);
createStars(1);
createStars(2);

