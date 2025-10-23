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

export { createGameboard, createStars }