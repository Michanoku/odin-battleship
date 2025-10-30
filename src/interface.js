const gameSetup = (function () {
  // The data for the ship currently dragged
  const dragData = {
    ship: '',
    direction: '',
    size: 0,
  }
  // The data for the ship placement for the user
  const shipPlacement = {
    'Patrol': {},
    'Cruiser': {},
    'Destroyer': {},
    'Interceptor': {},
    'Leviathan': {},
  }

  const enterName = document.querySelector('#enter-name');
  const confirmButton = document.querySelector('#confirm-button');
  const randomButton = document.querySelector('#random-button');
  const cpuButton = document.querySelector('#cpu-button');
  const humanButton = document.querySelector('#human-button');
  const resetButton = document.querySelector('#reset-button');
  const fireButton = document.querySelector('#fire-button');
  const newGameButton = document.querySelector('#new-game');

  const player1 = document.querySelector(`#player1`);
  const player2 = document.querySelector(`#player2`); 
  const setup = document.querySelector('#setup');
  const shipSelection = document.querySelector('#ship-selection');

  const announce = document.querySelector('#announce');
  const shipName = document.querySelector('#ship-name');
  const currentPlayer = document.querySelector('#current-player');

  function initializeGame() {
    createStars(1);
    createStars(2);
    createSetupBoard();
    createShipSelection();
    addListeners();
  }

  function setupPlayer2() {
    currentPlayer.textContent = 'Player 2';
    announce.textContent = 'Do you want to play against a human or the CPU?';
    setup.style.display = 'none';
    confirmButton.style.display = 'none';
    resetButton.style.display = 'none';
    randomButton.style.display = 'none';
    cpuButton.style.display = 'block';
    humanButton.style.display = 'block';
  }

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
    for (let i = 0; i < 11; i++) {
      for (let j = 0; j < 11; j++) {
        const cell = document.createElement('div');
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
          cell.dataset.vertical = i - 1;
          cell.dataset.horizontal = j - 1;
          // Required to allow dropping
          cell.addEventListener("dragover", (ev) => {
            ev.preventDefault(); 
          });
          // Drop the ship
          cell.addEventListener("drop", () => {
            dropShip(cell);
          });
        }
        gameboardDiv.appendChild(cell);
      }
    }
    player1.appendChild(gameboardDiv);
  }

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
    resetButton.style.display = 'block';
    confirmButton.style.display = 'block';
    confirmButton.disabled = true;
    randomButton.style.display = 'block';
    announce.textContent = 'Click to select a ship. Double click to rotate. Drag to place.';
    enterName.value = '';
    enterName.focus();
  }

  function addListeners() {
    enterName.addEventListener('input', validateUserSetup);
    resetButton.addEventListener('click', resetBoard);
    confirmButton.addEventListener('click', confirmPlayer);
    randomButton.addEventListener('click', callRandomizer);
    newGameButton.addEventListener('click', newGame);
    humanButton.addEventListener('click', humanPlayer2);
    cpuButton.addEventListener('click', confirmCpuPlayer);
  }

  function newGame() {
    // All DOM objects need to be rest to initial state
    currentPlayer.textContent = 'Player 1';
    confirmButton.disabled = true;
    shipName.textContent = '';

    // Reset all objects 
    document.querySelectorAll('div.gameboard').forEach(div => div.remove());
    while (shipSelection.firstChild) {
      shipSelection.removeChild(shipSelection.firstChild);
    }
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
    // Dispatch event to reset
    document.dispatchEvent(new CustomEvent('initialize'));
  }

  // Check if the user is finished setting up
  function validateUserSetup() {
    const nameValid = enterName.value.trim().length > 0;
    const shipsValid = Object.values(shipPlacement)
      .every(ship => ship && Object.keys(ship).length > 0);

    confirmButton.disabled = !(nameValid && shipsValid);
  }

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

  // Custom drag event
  // https://stackoverflow.com/questions/29131466/change-ghost-image-in-html5-drag-and-drop
  function dragShip(event, cell) {
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

  function dropShip(cell) {
    // Get the desired direction and the other direction
    const direction = dragData.direction;
    const other = direction === 'vertical' ? 'horizontal' : 'vertical';
    // Get the static coordinate from the other direction coordiante of the cell
    const staticCoord = cell.dataset[other];
    // Get the direction coordinate and the required empty cells next to this one
    const directionCoord = parseInt(cell.dataset[direction]);
    const required = dragData.size - 1
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
    shipPlacement[dragData.ship] = {
      coord: [parseInt(cell.dataset.horizontal), parseInt(cell.dataset.vertical)],
      size: dragData.size,
      direction: dragData.direction,
    };
    // Check if the user is done and if so activate confirm button
    validateUserSetup();
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

  // Reset the placement board
  function resetBoard() {
    // Reset placed ship data
    for (const ship in shipPlacement) {
      shipPlacement[ship] = {};
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

  function callRandomizer() {
    document.dispatchEvent(new CustomEvent('randomPlacement'));
  }

  function randomizeShips(placements) {
    console.log(placements);
    // Replace the current placements with the random ones
    for (const ship in placements) {
      shipPlacement[ship] = placements[ship];
    }
    // Reset the placement board before setting new cells
    const placedShips = document.querySelectorAll('.cell-ship');
    placedShips.forEach(ship => {
      ship.classList.remove('cell-ship');
    });
    // Set all cells in the ship coordinates to a ship cell
    for (const shipObject in shipPlacement) {
      const ship = shipPlacement[shipObject];
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

  function humanPlayer2() {
    setup.style.display = 'grid';
    confirmButton.style.display = 'block';
    resetButton.style.display = 'block';
    randomButton.style.display = 'block';
    cpuButton.style.display = 'none';
    humanButton.style.display = 'none';
    announce.textContent = 'Click to select a ship. Double click to rotate. Drag to place.';
  }

  // Confirm a CPU player entry
  function confirmCpuPlayer() {
    resetButton.style.display = 'none';
    confirmButton.style.display = 'none';
    randomButton.style.display = 'none';
    cpuButton.style.display = 'none';
    const playerData = {name: 'CPU', cpu: true, ships: {}};
    document.dispatchEvent(new CustomEvent('playerReady', { detail: playerData }));
  }

  // Confirm a player entry
  function confirmPlayer() {
    // create the player with the name and placed ships.
    resetButton.style.display = 'none';
    confirmButton.style.display = 'none';
    randomButton.style.display = 'none';
    cpuButton.style.display = 'none';
    const playerData = {name: enterName.value, cpu: false, ships: shipPlacement};
    document.dispatchEvent(new CustomEvent('playerReady', { detail: playerData })); 
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
    const colorWeights = { white: 70, blue: 10, red: 10, yellow: 10 };

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

  return { initializeGame, resetBoard, setupPlayer2, randomizeShips };
})();

const gameTurn = (function() {

  let attackTarget = [];

  const fireButton = document.querySelector('#fire-button');
  const endButton = document.querySelector('#end-button');
  const startButton = document.querySelector('#start-button');
  const player1 = document.querySelector(`#player1`);
  const player2 = document.querySelector(`#player2`); 
  const setup = document.querySelector('#setup');
  const announce = document.querySelector('#announce');
  const currentPlayer = document.querySelector('#current-player');

  // Set up the first turn
  function firstTurn(name) {
    resetMaps();
    addListeners();
    setup.style.display = 'none';
    player1.style.display = 'none';
    player2.style.display = 'none';
    currentPlayer.textContent = name;
    startButton.style.display = 'block';
    announce.textContent = `${makePossessive(name)} turn.`;
  }

  function resetMaps() {
    document.querySelectorAll('div.gameboard').forEach(div => div.remove());
  }

  function addListeners() {
    fireButton.addEventListener('click', () => {
      // Carry out attack and get results back
      document.dispatchEvent(new CustomEvent('fire', {detail: attackTarget}));
    });
    startButton.addEventListener('click', () => {
      // Show your current map and attack map 
      document.dispatchEvent(new CustomEvent('requestStart'));
    });
    endButton.addEventListener('click', () => {
      // Hide maps 
    });
  }

  function startTurn(state) {
    const otherPlayer = state.turn === 0 ? 1 : 0;
    const playerGameboard = state.players[state.turn].gameboard;
    const enemyGameboard = state.players[otherPlayer].gameboard;
    createGameboard('player', playerGameboard);
    createGameboard('enemy', enemyGameboard);
    player1.style.display = 'block';
    player2.style.display = 'block';
    startButton.style.display = 'none';
    fireButton.style.display = 'block';
    announce.textContent = 'Select a coordinate for your attack.';
  }

  function registerAttack(state, result, coords) {
    const otherPlayer = state.turn === 0 ? 1 : 0;
    const enemyGameboard = state.players[otherPlayer].gameboard;
    const name = state.players[state.turn].name;
    const readableCoords = makeReadableCoords(coords);
    const logResult = result.hit ? 'Hit!' : 'Miss.'
    player2.querySelector('.gameboard').remove();
    createGameboard('enemy', enemyGameboard);
    announce.textContent = `${name} attacks ${readableCoords}. ${logResult}`
    fireButton.style.display = 'none';
    endButton.style.display = 'block';
  }

  function createGameboard(boardType, gameboard) {
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
          if (boardType === 'player') {
            if (gameboardCell.ship) {
              cell.classList.add('cell-ship');
            }
            if (gameboardCell.attacked) {
              cell.classList.add('cell-attacked');
            }
          } else {
            if (gameboardCell.attacked) {
              cell.classList.add('cell-attacked');
              if (gameboardCell.ship) {
                cell.classList.add('cell-ship');
              }
            }
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

  function clickCell(cell) {
    const currentClicked = document.querySelector('.cell-clicked');
    if (currentClicked) {
      const [currentOuterHorizontal, currentOuterVertical] = getOuter(currentClicked);
      currentClicked.classList.remove('cell-clicked');
      currentOuterHorizontal.dataset.selected = 'false';
      currentOuterVertical.dataset.selected = 'false';
    }
    if (cell.classList.contains('cell-attacked')) {
      fireButton.disabled = true;
      return;
    }
    const [outerHorizontal, outerVertical] = getOuter(cell);
    cell.classList.add('cell-clicked');
    outerHorizontal.dataset.selected = 'true';
    outerVertical.dataset.selected = 'true';
    attackTarget = [parseInt(cell.dataset.horizontal) - 1, parseInt(cell.dataset.vertical) - 1];
    fireButton.disabled = false;
    // SET COORDINATES SOMWHERE TODO
  }

  function getOuter(cell) {
    const horizontal = cell.dataset.horizontal;
    const vertical = cell.dataset.vertical;
    const horizontalOuter = document.querySelector(`.enemy[data-horizontal='${horizontal}'][data-vertical='0']`);
    const verticalOuter = document.querySelector(`.enemy[data-horizontal='0'][data-vertical='${vertical}']`);
    return [horizontalOuter, verticalOuter]
  }

  function makePossessive(name) {
    name = name.trim();
    // Check if name ends with 's' or 'S'
    if (/[sS]$/.test(name)) {
      return `${name}'`;
    } else {
      return `${name}'s`;
    }
  }

  function makeReadableCoords(coords) {
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
    return `${rowMap[row]}${col}`;
  }

  return { firstTurn, startTurn, registerAttack }
})();



export { gameSetup, gameTurn }