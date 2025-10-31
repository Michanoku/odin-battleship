import "./styles.css";

import { Player } from './players.js';
import { cpuPlayer } from './cpu.js';
import { gameboardManager } from './gameboard.js';
import { gameSetup, gameTurn } from './interface.js';

// The game function that runs the entire game
const game = (function(){
  // The state that keeps the players and the current turn
  const state = {
    players: new Array(),
    turn: 0,
  };

  // Create a player and push it to the players array
  function addPlayer(data) {
    if (data.cpu) {
      state.players.push(new cpuPlayer());
    } else {
      const playerData = data.playerData;
      const name = playerData.name;
      const ships = playerData.ships;
      state.players.push(new Player(name, ships));
    }
  }

  // Start the game
  function start() {
    // Wait for players to finish their setup
    waitForPlayers();
    // Wait for players to reset the board
    waitForReset();
    // Wait for players to request random ship placement
    waitForRandomPlacement();
    // Initialize the game
    gameSetup.initializeGame();
  }
  
  // This starts the game phase of taking turns between players
  function takeTurns() {
    // Wait for a player to start their turn
    waitforStart();
    // Wait for a player to attack
    waitForAttack();
    // Wait for a player to end their turn
    waitForEnd();
    // Direct the interface to initialize the first turn
    gameTurn.firstTurn(state.players[0].name);
  }

  // Wait for players to finish their setup
  function waitForPlayers() {
    document.addEventListener('playerReady', (event) => {
      // Add the player with the data received
      addPlayer(event.detail);
      // If all players finished, start taking turns, else go to player 2 setup
      if (state.players.length === 2) {
        takeTurns();
      } else {
        gameSetup.resetBoard();
        gameSetup.setupPlayer2();
      }
    });
  }

  // Wait for a player to start a new game
  function waitForReset() {
    document.addEventListener('initialize', () => {
      // Reset all states
      state.players = new Array();
      // Initialize the game from the start
      gameSetup.initializeGame();
    });
  }

  // If the player wants to randomize the placement board
  function waitForRandomPlacement() {
    document.addEventListener('randomPlacement', () => {
      // Get random ship placements from the gameboard
      const shipPlacement = gameboardManager.randomPlacement();
      // Instruct interface to place them
      gameSetup.randomizeShips(shipPlacement);
    });
  }

  // Wait for the player to start the round
  function waitforStart() {
    document.addEventListener('requestStart', () => {
      // Instruct interface to start the turn with the current state
      gameTurn.startTurn(state);
    });
  }

  // Wait for the player to launch their attack
  function waitForAttack() {
    document.addEventListener('fire', (event) => {
      // Get the coordinates and the receiving player
      const coords = event.detail;
      const receivingPlayer = state.turn === 0 ? state.players[1] : state.players[0];
      // Let the receiving players gameboard receive the attack and get the result
      const result = receivingPlayer.gameboard.receiveAttack(coords);
      // Instruct the interface to show the attack result 
      gameTurn.registerAttack(state, result, coords);
    });
  }

  // Wait for the player to end the round
  function waitForEnd() {
    document.addEventListener('requestEnd', () => {
      // Set turn to the next turn 
      state.turn = state.turn === 0 ? 1 : 0;
      // If the player is a cpu, take it's turn
      if (state.players[state.turn].cpu) {
        const cpu = state.players[state.turn];
        const humanPlayer = state.turn === 0 ? state.players[1] : state.players[0];
        // Let the cpu decide on an attack coordinate
        const attackCoords = cpu.attackCell();
        // Let the human players gameboard receive the attack and get the result
        const result = humanPlayer.gameboard.receiveAttack(attackCoords);
        // Let the cpu know about the attack result
        cpu.getAttackResults(result, attackCoords);
        state.turn = state.turn === 0 ? 1 : 0;
        gameTurn.registerCpuAttack(humanPlayer, result, attackCoords);
      } else {
        // Instruct the interface to end the turn
        gameTurn.endTurn(state);
      }
    });
  }

  return { start }
})();

// Start the game
game.start();