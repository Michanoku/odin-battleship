// Required Nodes
const enterName = document.querySelector('#enter-name');
const confirmButton = document.querySelector('#confirm-button');
const randomButton = document.querySelector('#random-button');
const cpuButton = document.querySelector('#cpu-button');
const humanButton = document.querySelector('#human-button');
const resetButton = document.querySelector('#reset-button');
const fireButton = document.querySelector('#fire-button');
const newGameButton = document.querySelector('#new-game');
const altColorsButton = document.querySelector('#alt-colors');
const startButton = document.querySelector('#start-button');
const endButton = document.querySelector('#end-button');
const player1 = document.querySelector(`#player1`);
const player2 = document.querySelector(`#player2`); 
const setup = document.querySelector('#setup');
const shipSelection = document.querySelector('#ship-selection');
const announce = document.querySelector('#announce');
const shipName = document.querySelector('#ship-name');
const currentPlayer = document.querySelector('#current-player');

// The data for the ship currently dragged
const dragData = {
  ship: '',
  direction: '',
  size: 0,
}

const setupData = {
  players: new Array(),
  shipPlacement: {
    'Patrol': {},
    'Cruiser': {},
    'Destroyer': {},
    'Interceptor': {},
    'Leviathan': {},
  },
}

// Keep track of some states like current selected target cell and turn
const state = {
  attackTarget: [],
  turnEnd: false,
  initialized: false,
}

/* ----- GAME SETUP ----- */
// Initialize the game by creating the background, the setups and listeners
function initializeGame() {
  if (!state.initialized) {
    createStars(1);
    createStars(2);
    addListeners();
    state.initialized = true;
  }
  createSetupBoard();
  createShipSelection();
}

// Create a random starry background
function createStars(player) {
  const playerField = document.querySelector(`#player${player}`);
  const numStars = Math.floor(Math.random() * 11) + 60; // About 60 stars

  // Pick random weights of stars
  function weightedRandom(weights) {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    const rand = Math.random() * total;
    let sum = 0;
    for (const [key, weight] of Object.entries(weights)) {
      sum += weight;
      if (rand < sum) return key;
    }
  }
  
  // Set the weights for sizes and colors of stars
  const sizeWeights = { small: 70, medium: 25, large: 5 };
  const colorWeights = {
      'star-O' : 5,
      'star-B' : 10,
      'star-A' : 15,
      'star-F' : 15,
      'star-G' : 15,
      'star-K' : 20,
      'star-M' : 20,
  };

  // For every star, set a random color and size and position
  for (let i = 0; i < numStars; i++) {
    const star = document.createElement('div');

    const sizeClass = weightedRandom(sizeWeights);
    const colorClass = weightedRandom(colorWeights);

    star.classList.add(sizeClass, colorClass);

    // Set the position but do not get too close to the border
    const margin = 5;
    const top = margin + Math.random() * (100 - margin * 2);
    const left = margin + Math.random() * (100 - margin * 2);

    star.style.top = `${top}%`;
    star.style.left = `${left}%`;

    playerField.appendChild(star);
  }
}

// Add all listeners needed
function addListeners() {
  newGameButton.addEventListener('click', newGame);
  altColorsButton.addEventListener('click', altColors);
  resetButton.addEventListener('click', resetBoard);
  randomButton.addEventListener('click', callRandomizer);
  enterName.addEventListener('input', validateUserSetup);
  humanButton.addEventListener('click', humanPlayer2);
  confirmButton.addEventListener('click', () => {
    // Confirm a human player
    confirmPlayer(false);
  });
   cpuButton.addEventListener('click', () => {
    // Confirm a cpu player
    confirmPlayer(true);
  });
  fireButton.addEventListener('click', () => {
    // Carry out attack and get results back
    document.dispatchEvent(new CustomEvent('fire', {detail: state.attackTarget}));
  });
  startButton.addEventListener('click', () => {
    // Show your current map and attack map 
    document.dispatchEvent(new CustomEvent('requestStart'));
  });
  endButton.addEventListener('click', () => {
    // Hide maps and end the turn
    document.dispatchEvent(new CustomEvent('requestEnd'));
  });
}

// Creates the board the player places ships on 
function createSetupBoard() {
  const gameboardDiv = document.createElement('div');
  const coordMap = {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
    5: 'E',
    6: 'F',
    7: 'G',
    8: 'H',
    9: 'I',
    10: 'J',
  }
  gameboardDiv.classList.add('gameboard');
  // Create a grid of cells to place ships on
  for (let i = 0; i < 11; i++) {
    for (let j = 0; j < 11; j++) {
      const cell = document.createElement('div');
      // Outer cells have coordinates on them
      if (i === 0) {
        cell.classList.add('cell-outer');
        if (j !== 0) {
          cell.textContent = j;
        }
      } else if (j === 0) {
        cell.classList.add('cell-outer');
        cell.textContent = coordMap[i];
      } else {
        // Inner cells can accept ships
        cell.classList.add('cell-inner');
        cell.dataset.vertical = i - 1;
        cell.dataset.horizontal = j - 1;
        // Required to allow dropping
        cell.addEventListener("dragover", (event) => {
          event.preventDefault(); 
        });
        // Event Listener to drop a ship 
        cell.addEventListener("drop", () => {
          dropShip(cell);
        });
      }
      gameboardDiv.appendChild(cell);
    }
  }
  player1.appendChild(gameboardDiv);
}

// Creates the ships that can be dragged and dropped by the user
function createShipSelection() {
  // Define coordinate groups for each class of direction and ship type
  const directionMap = {
    core: [
      [0, 0], [0, 3], [0, 7],
      [4, 0], [4, 5],
    ],
    horizontal: [
      [0, 1], [0, 4], [0, 5], [0, 8], [0, 9],
      [4, 1], [4, 2], [4, 3], [4, 6], [4, 7], [4, 8], [4, 9],
    ],
    vertical: [
      [1, 0], [1, 3], [2, 3], [1, 7], [2, 7],
      [5, 0], [6, 0], [7, 0],
      [5, 5], [6, 5], [7, 5], [8, 5],
    ],
  };
  const shipMap = {
    'Patrol': [
      [0,0], [0,1], [1,0]
    ],
    'Cruiser': [
      [0,3], [0,4], [0,5], [1,3], [2,3]
    ],
    'Destroyer': [
      [0,7], [0,8], [0,9], [1,7], [2,7]
    ],
    'Interceptor': [
      [4,0], [4,1], [4,2], [4,3], [5,0], [6,0], [7,0]
    ],
    'Leviathan': [
      [4,5], [4,6], [4,7], [4,8], [4,9], [5,5], [6,5], [7,5], [8,5]
    ]
  };
  // Create maps for for the coordinates to lookup faster
  const coordDirectionMap = new Map();
  for (const [className, coords] of Object.entries(directionMap)) {
    for (const [row, col] of coords) {
      coordDirectionMap.set(`${row},${col}`, className);
    }
  }
  const coordShipMap = new Map();
  for (const [className, coords] of Object.entries(shipMap)) {
    for (const [row, col] of coords) {
      coordShipMap.set(`${row},${col}`, className);
    }
  }
  // Create the grid for ship selection and place the ships inside
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 10; j++) {
      // Create a cell and give it the standart class
      const cell = document.createElement('div');
      cell.classList.add('cell-inner');
      // Get the class and if there is one, set it
      const shipClass = coordShipMap.get(`${i},${j}`);
      if (shipClass) {
        cell.dataset.ship = shipClass;
      }
      // Get the direction and set some values depending on the direction
      const directionClass = coordDirectionMap.get(`${i},${j}`);
      if (directionClass) {
        // Core cells have both vertical and horizontal, so set both to true
        cell.dataset.vertical = 'true';
        cell.dataset.horizontal = 'true';
        // If the cell is vertical or horizontal instead, set the opposite false
        if (directionClass === 'vertical') {
          cell.dataset.horizontal = 'false';
        } else if (directionClass === 'horizontal') {
          cell.dataset.vertical = 'false';
        }
        cell.dataset.current = 'vertical';
        // All ships are vertical at first, so only set ship for those cells
        if (directionClass !== 'horizontal') {
          cell.classList.add('ship');
        }
        // Enable dragging.
        cell.draggable = true;
        // Add Event Listeners for grad, click and doubleclick
        cell.addEventListener("dragstart", (event) => {
          dragShip(event, cell);
        });
        cell.addEventListener('click', () => {
          selectShip(cell);
        });
        cell.addEventListener('dblclick', () => {
          rotateShip(cell);
        });
      }
      shipSelection.appendChild(cell);
    }
  }
  // Set some other node to be visible and reset some values to initial values
  resetButton.style.display = 'block';
  confirmButton.style.display = 'block';
  randomButton.style.display = 'block';
  confirmButton.disabled = true;
  announce.textContent = 'Click to select a ship. Double click to rotate. Drag to place.';
  enterName.value = '';
  enterName.focus();
}

// When the player selects to start a new game, initialize everything
function newGame() {
  const choice = confirm("Start a new game? Current progress will be lost.");
  if (choice) {
    // All DOM objects need to be rest to initial state
    currentPlayer.textContent = 'Player 1';
    confirmButton.disabled = true;
    shipName.textContent = '';
    setupData.players = new Array();
    setupData.shipPlacement = {
      'Patrol': {},
      'Cruiser': {},
      'Destroyer': {},
      'Interceptor': {},
      'Leviathan': {},
    },

    // Reset all objects 
    document.querySelectorAll('div.gameboard').forEach(div => div.remove());
    while (shipSelection.firstChild) {
      shipSelection.removeChild(shipSelection.firstChild);
    }
    resetMaps();
    // Hide objects to hide
    player2.style.display = 'none';
    cpuButton.style.display = 'none';
    // Show objects to show
    setup.style.display = 'grid';
    resetButton.style.display = 'block';
    confirmButton.style.display = 'block';
    randomButton.style.display = 'block';
    cpuButton.style.display = 'none';
    humanButton.style.display = 'none';
    fireButton.style.display = 'none';
    startButton.style.display = 'none';
    endButton.style.display = 'none';
    // Dispatch event to reset
    document.dispatchEvent(new CustomEvent('initialize'));
  }
}

function resetMaps() {
  [player1, player2].forEach(player =>
    player.querySelectorAll('.gameboard').forEach(el => el.remove())
  );
}

// Allows switching between color modes for accessibility
function altColors() {
  document.documentElement.classList.toggle('alt-colors');
}

// Reset the placement board
function resetBoard() {
  // Reset placed ship data
  setupData.shipPlacement = {
    'Patrol': {},
    'Cruiser': {},
    'Destroyer': {},
    'Interceptor': {},
    'Leviathan': {},
  }
  // Reset ship placement
  const placedShips = document.querySelectorAll('.cell-ship');
  placedShips.forEach(ship => {
    ship.classList.remove('cell-ship');
  });
  // Reset ship selection
  const shipSelection = document.querySelectorAll('[data-current]');
  shipSelection.forEach(cell => {
    cell.dataset.current = 'vertical';
    cell.dataset.selected = 'false';
    if (cell.dataset.vertical === 'true') {
      cell.classList.add('ship');
    } else {
      cell.classList.remove('ship');
    }
  });
  // State and erase the players placed ship data and name
  enterName.value = '';
  enterName.focus();
  confirmButton.disabled = true;
  shipName.textContent = '';
}

// Call the randomizer (it will send a randomized board)
function callRandomizer() {
  document.dispatchEvent(new CustomEvent('randomPlacement'));
}

// Confirm a player entry
function confirmPlayer(cpu) {

  // create the player with the name and placed ships.
  resetButton.style.display = 'none';
  confirmButton.style.display = 'none';
  randomButton.style.display = 'none';
  cpuButton.style.display = 'none';
  humanButton.style.display = 'none';
  if (cpu) {
    setupData.players.push({cpu: true});
  } else {
    setupData.players.push({name: enterName.value, ships: Object.assign({}, setupData.shipPlacement)});
  }
  if (setupData.players.length === 2) {
    document.dispatchEvent(new CustomEvent('playersReady', {detail: setupData.players})); 
  } else {
    resetBoard();
    currentPlayer.textContent = 'Player 2';
    announce.textContent = 'Do you want to play against a human or the CPU?';
    setup.style.display = 'none';
    player1.style.display = 'none';
    confirmButton.style.display = 'none';
    resetButton.style.display = 'none';
    randomButton.style.display = 'none';
    cpuButton.style.display = 'block';
    humanButton.style.display = 'block';
    startButton.style.display = 'none';
    endButton.style.display = 'none';
  }
}

// Check if the user is finished setting up
function validateUserSetup() {
  const nameValid = enterName.value.trim().length > 0;
  const shipsValid = Object.values(setupData.shipPlacement)
    .every(ship => ship && Object.keys(ship).length > 0);

  confirmButton.disabled = !(nameValid && shipsValid);
}

// If player 2 is human, show appropriate content
function humanPlayer2() {
  setup.style.display = 'grid';
  player1.style.display = 'block';
  confirmButton.style.display = 'block';
  resetButton.style.display = 'block';
  randomButton.style.display = 'block';
  cpuButton.style.display = 'none';
  humanButton.style.display = 'none';
  announce.textContent = 'Click to select a ship. Double click to rotate. Drag to place.';
}

// What happens when a ship is selected
function selectShip(clicked) {
  // Save some nodes first
  const allShips = document.querySelectorAll('.ship');
  // Make sure only the same ships are selected
  const sameShips = document.querySelectorAll(`div[data-ship='${clicked.dataset.ship}']`);
  allShips.forEach(ship => {
    ship.dataset.selected = false;
  });
  sameShips.forEach(ship => {
    ship.dataset.selected = true;
  });
  // Show the name of the selected ship
  shipName.textContent = clicked.dataset.ship;
}

// Rotate the ship in the grid
function rotateShip(clicked) {
  // Get the current direction and other direction 
  const current = clicked.dataset.current;
  const other = current === 'vertical' ? 'horizontal' : 'vertical';
  // Remove ship from the current, add it to the other, and set the current to other
  const allShips = document.querySelectorAll(`div[data-ship='${clicked.dataset.ship}']`);
  allShips.forEach(ship => {
    if (ship.dataset[other] === 'true') {
      ship.classList.add('ship');
    } else {
      ship.classList.remove('ship');
    }
    ship.dataset.current = other;
  });
}

// Custom drag event
// https://stackoverflow.com/questions/29131466/change-ghost-image-in-html5-drag-and-drop
function dragShip(event, cell) {
  // First select the ship we are draggin.
  selectShip(cell);
  // The sizes of the ships
  const shipMap = {
    'Patrol': 2,
    'Cruiser': 3,
    'Destroyer': 3,
    'Interceptor': 4,
    'Leviathan': 5,
  }
  const direction = cell.dataset.current;
  const size = shipMap[cell.dataset.ship];
  dragData.direction = direction;
  dragData.size = size;
  dragData.ship = cell.dataset.ship;
  // Create a ghost to use instead of the default
  const dragGhost = createGhost(cell, size, direction)
  // Get the size and replace the default with the ghost
  const cellSize = cell.getBoundingClientRect();
  // Also set the cursor to the center of the ghost
  event.dataTransfer.setDragImage(dragGhost, cellSize.width / 2, cellSize.height / 2);
  // Once the drag is over, remove the ghost again
  event.target.addEventListener(
    "dragend",
    function () {
      dragGhost.remove();
    },
    { once: true }
  );
};

// Create a ghost image for the draggable content to replace the default
function createGhost(cell, size, direction) {
  // Create a ghost grid to imitate the grid the cell is currently on
  const ghost = document.createElement("div");
  ghost.style.display = "grid";
  ghost.style.position = "absolute";
  ghost.style.top = "-9999px";
  ghost.style.left = "-9999px";

  // Set the direction based on the ship data
  ghost.style.gridAutoFlow = direction === "horizontal" ? "column" : "row";

  // Get the size of the cell 
  const cellSize = cell.getBoundingClientRect();

  // Append as many cells as needed to replicate ship size
  for (let i = 0; i < size; i++) {
    const clone = cell.cloneNode(true);
    clone.style.width = `${cellSize.width}px`;
    clone.style.height = `${cellSize.height}px`;
    clone.style.opacity = "0.8";
    ghost.appendChild(clone);
  }
  document.body.appendChild(ghost);
  return ghost;
}

// Allows ships to be dropped on a cell and registered
function dropShip(cell) {
  // Get the desired direction and the other direction
  const direction = dragData.direction;
  const other = direction === 'vertical' ? 'horizontal' : 'vertical';
  // Get the static coordinate from the other direction coordiante of the cell
  const staticCoord = cell.dataset[other];
  // Get the direction coordinate and the required empty cells next to this one
  const directionCoord = parseInt(cell.dataset[direction]);
  const required = dragData.size - 1;
  // If the ship would go over the edge, return
  if ((directionCoord + required) > 9) {
    return;
  } 
  // For all cells we are about to occupy, if a ship is on any, return
  for (let i = directionCoord; i < (directionCoord + dragData.size); i++) {
    const targetCell = document.querySelector(`.cell-inner[data-${direction}='${i}'][data-${other}='${staticCoord}']`);
    if (targetCell.classList.contains('cell-ship')) {
      return;
    }
  }
  // If there is no ship and no overflow, place the ship on all the cells
  for (let i = directionCoord; i < (directionCoord + dragData.size); i++) {
    const targetCell = document.querySelector(`.cell-inner[data-${direction}='${i}'][data-${other}='${staticCoord}']`);
    targetCell.classList.add('cell-ship');
  }
  // Remove the placed ship from the ship selector
  const selectedShip = document.querySelectorAll(`.ship[data-ship='${dragData.ship}']`);
  selectedShip.forEach(part => {
    part.classList.remove('ship');
  });
  // Save the data in the placement object
  setupData.shipPlacement[dragData.ship] = {
    coord: [parseInt(cell.dataset.vertical), parseInt(cell.dataset.horizontal)],
    size: dragData.size,
    direction: dragData.direction,
  };
  // Check if the user is done and if so activate confirm button
  validateUserSetup();
}

// Places the random ships handed by the gameflow
function randomizeShips(placements) {
  // Replace the current placements with the random ones
  for (const ship in placements) {
    setupData.shipPlacement[ship] = placements[ship];
  }
  // Reset the placement board before setting new cells
  const placedShips = document.querySelectorAll('.cell-ship');
  placedShips.forEach(ship => {
    ship.classList.remove('cell-ship');
  });
  // Set all cells in the ship coordinates to a ship cell
  for (const shipObject in setupData.shipPlacement) {
    const ship = setupData.shipPlacement[shipObject];
    const staticCoord = ship.direction === 'horizontal' ? ship.coord[0] : ship.coord[1];
    const movingCoord = ship.direction === 'horizontal' ? ship.coord[1] : ship.coord[0];
    const otherDirection = ship.direction === 'horizontal' ? 'vertical' : 'horizontal';
    for (let i = 0; i < ship.size; i++) {
      const position = movingCoord + i;
      const cell = document.querySelector(`[data-${otherDirection}='${staticCoord}'][data-${ship.direction}='${position}']`);
      cell.classList.add('cell-ship');
    }
  }
  // disappear all ships on the selection
  const shipSelection = document.querySelectorAll('[data-current]');
  shipSelection.forEach(cell => {
    cell.classList.remove('ship');
  });
  // check validation
  validateUserSetup();
}

/* ----- TURNS ----- */
// Set up the turn
function turn(state, status) {
  const name = state.players[state.turn].name;
  if (status === 'first') {
    resetMaps();
    setup.style.display = 'none';
    player1.style.display = 'none';
    player2.style.display = 'none';
    currentPlayer.textContent = name;
    startButton.style.display = 'block';
    announce.textContent = `${makePossessive(name)} turn.`;
  } else if (status === 'start') {
    // Get the other players location in the array
    const otherPlayer = state.turn === 0 ? 1 : 0;
    // Get the two gameboards and show them
    const playerGameboard = state.players[state.turn].gameboard;
    const enemyGameboard = state.players[otherPlayer].gameboard;
    createGameboard('player', playerGameboard);
    createGameboard('enemy', enemyGameboard);
    // Show and hide elements
    startButton.style.display = 'none';
    player1.style.display = 'block';
    player2.style.display = 'block';
    fireButton.style.display = 'block';
    announce.textContent = 'Select a coordinate for your attack.';
    state.turnEnd = false;
  } else {
    // Hide maps and reset them
    player1.style.display = 'none';
    player2.style.display = 'none';
    resetMaps();
    // Hide other elements
    fireButton.style.display = 'none';
    endButton.style.display = 'none';
    // Get the current players name, and change textContents
    const name = state.players[state.turn].name;
    currentPlayer.textContent = name;
    announce.textContent = `${makePossessive(name)} turn.`;
    startButton.style.display = 'block';
  }
}

// Register an attack result 
function registerAttack(state, result, coords, cpu) {
  fireButton.disabled = true;
  state.attackTarget = [];
  // Get the other players location in the array and their gameboard
  const otherPlayer = state.turn === 0 ? 1 : 0;
  const gameboard = state.players[otherPlayer].gameboard;
  // Get the name of the current player and the attack details
  const name = state.players[state.turn].name;
  const readableCoords = makeReadableCoords(coords);
  const logResult = result.hit ? 'Hit.' : 'Miss.'
  // Remove the current gameboard and show the updated one with the attack
  if (cpu) {
    player1.querySelector('.gameboard').remove();
    createGameboard('player', gameboard);
    endButton.style.display = 'none';
  } else {
    player2.querySelector('.gameboard').remove();
    createGameboard('enemy', gameboard);
    fireButton.style.display = 'none';
  }
  // Check if the game is over and show appropriate messages
  if (result.allSunk) {
    const attackResult = `${name} attacks ${readableCoords}. ${logResult}`;
    const gameResult = `All ships destroyed. ${name} wins.`;
    announce.textContent = `${attackResult} ${gameResult}`;
  } else {
    announce.textContent = `${name} attacks ${readableCoords}. ${logResult}`;
    if (cpu) {
      fireButton.style.display = 'block';
    } else {
      endButton.style.display = 'block';
    }
    state.turnEnd = cpu ? false : true;
  }
}

// Create the gameboard visual from the gameboard data
function createGameboard(boardType, gameboard) {
  // If the board type is player, all ships can be shown, if enemy, only hits
  const playerField = boardType === 'player' ? player1 : player2;
  const gameboardDiv = document.createElement('div');
  const coordMap = {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
    5: 'E',
    6: 'F',
    7: 'G',
    8: 'H',
    9: 'I',
    10: 'J',
  }
  gameboardDiv.classList.add('gameboard');
  for (let i = 0; i < 11; i++) {
    for (let j = 0; j < 11; j++) {
      const cell = document.createElement('div');
      // Add player or enemy class to the cell, as well as location in grid
      cell.classList.add(boardType);
      cell.dataset.horizontal = j;
      cell.dataset.vertical = i;
      if (i === 0) {
        cell.classList.add('cell-outer');
        if (j !== 0) {
          cell.textContent = j;
        }
      } else if (j === 0) {
        cell.classList.add('cell-outer');
        cell.textContent = coordMap[i];
      } else {
        cell.classList.add('cell-inner');
        const gameboardCell = gameboard.grid[i-1][j-1];
        // If the board is the player's show all ships and attacks by the enemy
        if (boardType === 'player') {
          if (gameboardCell.ship) {
            cell.classList.add('cell-ship');
          }
          if (gameboardCell.attacked) {
            cell.classList.add('cell-attacked');
          }
        } else {
          // On the enemy board, only show attacked cells (and ships in them)
          if (gameboardCell.attacked) {
            cell.classList.add('cell-attacked');
            if (gameboardCell.ship) {
              cell.classList.add('cell-ship');
            }
          }
          // Add the listener for a cell to be clicked to attack
          cell.addEventListener('click', () => {
            clickCell(cell);
          })
        }
      }
      gameboardDiv.appendChild(cell);
    }
  }
  playerField.appendChild(gameboardDiv);
}

// Click a cell to select it for attack
function clickCell(cell) {
  // Deselect the current cell and their coordinate pairs
  const currentClicked = document.querySelector('.cell-clicked');
  if (currentClicked) {
    const [currentOuterHorizontal, currentOuterVertical] = getOuter(currentClicked);
    currentClicked.classList.remove('cell-clicked');
    currentOuterHorizontal.dataset.selected = 'false';
    currentOuterVertical.dataset.selected = 'false';
  }
  // Do not allow already attacked cells to be selected
  if (cell.classList.contains('cell-attacked') || state.turnEnd) {
    fireButton.disabled = true;
    return;
  }
  // Get the outer cells to highlight them 
  const [outerHorizontal, outerVertical] = getOuter(cell);
  cell.classList.add('cell-clicked');
  outerHorizontal.dataset.selected = 'true';
  outerVertical.dataset.selected = 'true';
  // Send the current coordinate to the attackTarget variable
  state.attackTarget = [parseInt(cell.dataset.vertical) - 1, parseInt(cell.dataset.horizontal) - 1];
  fireButton.disabled = false;
}

// Get the outter cells that contain the coordinate symbols for highlighting
function getOuter(cell) {
  const horizontal = cell.dataset.horizontal;
  const vertical = cell.dataset.vertical;
  const horizontalOuter = document.querySelector(`.enemy[data-horizontal='${horizontal}'][data-vertical='0']`);
  const verticalOuter = document.querySelector(`.enemy[data-horizontal='0'][data-vertical='${vertical}']`);
  return [horizontalOuter, verticalOuter]
}

// Make the correct possessive form for the players name
function makePossessive(name) {
  name = name.trim();
  // Check if name ends with 's' or 'S'
  if (/[sS]$/.test(name)) {
    return `${name}'`;
  } else {
    return `${name}'s`;
  }
}

// Create a readable coordinate pair
function makeReadableCoords(coords) {
  // Exchange row integer with letter, add 1 to col
  const [row, col] = coords;
  const rowMap = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: 'E',
    5: 'F',
    6: 'G',
    7: 'H',
    8: 'I',
    9: 'J',
  };
  return `${rowMap[row]}${col + 1}`;
}

export { initializeGame, randomizeShips, turn, registerAttack };