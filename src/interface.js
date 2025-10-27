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

  function createSetupBoard() {
    const playerField = document.querySelector(`#player1`);
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
    playerField.appendChild(gameboardDiv);
  }

  function createShipSelection() {
    const shipSelection = document.querySelector('#ship-selection');
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
    createOptions();
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
      coord: [cell.dataset.horizontal, cell.dataset.vertical],
      size: dragData.size,
      direction: dragData.direction,
    };
  }

  // What happens when a ship is selected
  function selectShip(clicked) {
    // Save some nodes first
    const shipName = document.querySelector('#ship-name');
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

  // Create the options menu 
  function createOptions() {
    const enterName = document.querySelector('#enter-name');
    enterName.focus();
  }

  return { createSetupBoard, createShipSelection};
})();

function createGameboard(player, gameboard=null) {
  const playerField = document.querySelector(`#player${player}`);
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
        if (gameboard && gameboard[i-1][j-1].ship) {
          cell.classList.add('cell-ship');
        }
        if (gameboard && gameboard[i-1][j-1].attacked) {
          cell.classList.add('cell-attacked');
        }
      }
      gameboardDiv.appendChild(cell);
    }
  }
  playerField.appendChild(gameboardDiv);
}

// small -> 0,0 0,1 1,0
// medium1 -> 0,3 0,4 0,5 1,3 2,3 
// medium2 -> 0,6 0,7 0,8 1,6 2,6
// large -> 4,0 4,1 4,2 4,3 5,0 6,0 7,0 
// giant -> 4,5 4,6 4,7 4,8 4,9 5,5 6,5 7,5 8,5   

// cores -> 0,0 0,3 0,6 4,0 4,5
// horizontal -> 0,1 0,4 0,5 0,7 0,8 4,1 4,2 4,3 4,6 4,7 4,8 4,9 
// vertical -> 1,0 1,3 2,3 1,6 2,6 5,0 6,0 7,0 5,5 6,5 7,5 8,5 

// All ship cells get a 
// class: ship
// data-ship: small, medium1, medium2, large, giant 
// data-type: core,horizontal or vertical
// data-current: vertical, horizontal
// If a ship cell is clicked, check which ship. Then, check the cell for the current orientation
// If the ship is vertical, remove the class from all horizontal cells, add to vertical cells

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

export { gameSetup, createGameboard, createStars }