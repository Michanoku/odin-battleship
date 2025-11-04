import "./styles.css";

import { Player } from './players.js';
import { CPUPlayer } from './cpu.js';
import { randomPlacement } from './gameboard.js';
import { initializeGame, randomizeShips, turn, registerAttack } from './interface.js';


// The state that keeps the players and the current turn
const state = {
  players: new Array(),
  turn: 0,
  initializedTurns: false,
};

// Create a player and push it to the players array
function addPlayer(data) {
  if (data.cpu) {
    state.players.push(new CPUPlayer());
  } else {
    const name = data.name;
    const ships = data.ships;
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
  initializeGame();
}

// This starts the game phase of taking turns between players
function takeTurns() {
  if (!state.initializedTurns) {
    // Wait for a player to start their turn
    waitforStart();
    // Wait for a player to attack
    waitForAttack();
    // Wait for a player to end their turn
    waitForEnd();
    state.initializedTurns = true;
  }
  // Direct the interface to initialize the first turn
  turn(state, 'first');
}

// Wait for players to finish their setup
function waitForPlayers() {
  document.addEventListener('playersReady', (event) => {
    const players = event.detail;
    players.forEach(player => {
      addPlayer(player);
    });
    takeTurns();
  });
}

// Wait for a player to start a new game
function waitForReset() {
  document.addEventListener('initialize', () => {
    // Reset all states
    state.players = new Array();
    state.turn = 0;
    // Initialize the game from the start
    initializeGame('new');
  });
}

// If the player wants to randomize the placement board
function waitForRandomPlacement() {
  document.addEventListener('randomPlacement', () => {
    // Get random ship placements from the gameboard
    const shipPlacement = randomPlacement();
    // Instruct interface to place them
    randomizeShips(shipPlacement);
  });
}

// Wait for the player to start the round
function waitforStart() {
  document.addEventListener('requestStart', () => {
    // Instruct interface to start the turn with the current state
    turn(state, 'start');
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
    registerAttack(state, result, coords, false);
  });
}

// Wait for the player to end the round
function waitForEnd() {
  document.addEventListener('requestEnd', () => {
    // Set turn to the next turn 
    state.turn = state.turn === 0 ? 1 : 0;
    // If the player is a cpu, take it's turn
    if (state.players[state.turn].constructor === CPUPlayer) {
      const cpu = state.players[state.turn];
      const humanPlayer = state.turn === 0 ? state.players[1] : state.players[0];
      // Let the cpu decide on an attack coordinate
      const attackCoords = cpu.attackCell();
      // Let the human players gameboard receive the attack and get the result
      const result = humanPlayer.gameboard.receiveAttack(attackCoords);
      // Let the cpu know about the attack result
      cpu.getAttackResults(result, attackCoords);
      registerAttack(state, result, attackCoords, true);
      state.turn = state.turn === 0 ? 1 : 0;
    } else {
      // Instruct the interface to end the turn
      turn(state, 'end');
    }
  });
}

// Start the game
start();