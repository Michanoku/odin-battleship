function createGameboard(player) {
  const playerField = document.querySelector(`#player${player}`);
  const gameboard = document.createElement('div');
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
  gameboard.classList.add('gameboard');
  for (let i = 0; i < 11; i++) {
    for (let j = 0; j < 11; j++) {
      const cell = document.createElement('div');
      if (i === 0) {
        cell.classList.add('cell-outer');
        if (j !== 0) {
          cell.textContent = i;
        }
      } else if (j === 0) {
        cell.classList.add('cell-outer');
        cell.textContent = coordMap[j];
      } else {
        cell.classList.add('cell-inner');
      }
      gameboard.appendChild(cell);
    }
  }
  playerField.appendChild(gameboard);
}

export { createGameboard }