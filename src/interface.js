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
function createShipSelection() {
  const shipSelection = document.querySelector('#ship-selection');
  // Define coordinate groups for each class
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
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 10; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell-inner');
      const shipClass = coordShipMap.get(`${i},${j}`);
      if (shipClass) {
        cell.dataset.ship = shipClass;
      }
      const directionClass = coordDirectionMap.get(`${i},${j}`);
      if (directionClass) {
        cell.dataset.type = directionClass;
        cell.dataset.current = 'vertical';
        cell.name = 'ship';
        if (directionClass !== 'horizontal') {
          cell.classList.add('ship');
        }
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

function selectShip(clicked) {
  const shipName = document.querySelector('#ship-name');
  const allShips = document.querySelectorAll('.ship');
  const sameShips = document.querySelectorAll(`div[data-ship='${clicked.dataset.ship}']`);
  allShips.forEach(ship => {
    ship.dataset.selected = false;
  });
  sameShips.forEach(ship => {
    ship.dataset.selected = true;
  });
  shipName.textContent = clicked.dataset.ship;
}

function rotateShip(clicked) {
  const current = clicked.dataset.current;
  const other = current === 'vertical' ? 'horizontal' : 'vertical';
  const allShips = document.querySelectorAll(`div[data-ship='${clicked.dataset.ship}']`);
  allShips.forEach(ship => {
    if (ship.dataset.type === other) {
      ship.classList.add('ship');
    } else if (ship.dataset.type === current) {
      ship.classList.remove('ship');
    }
    ship.dataset.current = other;
  });
}

function createOptions() {
  const enterName = document.querySelector('#enter-name');
  enterName.focus();
}

// Create a random starry background
function createStars(player) {
  const playerField = document.querySelector(`#player${player}`);
  const numStars = Math.floor(Math.random() * 11) + 60; // 40–50 stars

  // Weighted random pick helper
  function weightedRandom(weights) {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    const rand = Math.random() * total;
    let sum = 0;
    for (const [key, weight] of Object.entries(weights)) {
      sum += weight;
      if (rand < sum) return key;
    }
  }

  const sizeWeights = { small: 70, medium: 25, large: 5 };
  const colorWeights = { white: 70, blue: 10, red: 10, yellow: 10 };

  for (let i = 0; i < numStars; i++) {
    const star = document.createElement('div');

    const sizeClass = weightedRandom(sizeWeights);
    const colorClass = weightedRandom(colorWeights);

    star.classList.add(sizeClass, colorClass);

    // Random position on screen
    const margin = 5;
    const top = margin + Math.random() * (100 - margin * 2);
    const left = margin + Math.random() * (100 - margin * 2);

    star.style.top = `${top}%`;
    star.style.left = `${left}%`;

    playerField.appendChild(star);
  }
}

export { createGameboard, createShipSelection, createStars }