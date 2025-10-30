import { gameboardManager } from './gameboard.js';

// Test the creation of the gameboard grid array
test('Gameboard creation.', () => {
  const gameboard = gameboardManager.createGameboard();
  expect(gameboard.grid.length).toBe(10);
  for (const row of gameboard.grid) {
    expect(row.length).toBe(10);
  }
});

// Test gameboard grid cells
test('Gameboard grid cells.', () => {
  const gameboard = gameboardManager.createGameboard();

  for (let i = 0; i < gameboard.grid.length; i++) {
    for (let j = 0; j < gameboard.grid[i].length; j++) {
      const cell = gameboard.grid[i][j];
      expect(cell.coords).toEqual([i, j]);
      expect(cell.attacked).toBe(false);
      expect(cell.ship).toBeNull();
      expect(cell.horizontal).toBeGreaterThanOrEqual(0);
      expect(cell.horizontal).toBeLessThanOrEqual(4);
      expect(cell.vertical).toBeGreaterThanOrEqual(0);
      expect(cell.vertical).toBeLessThanOrEqual(4);
    }
  }
});


// Test ship placement
test('Ship placement 2.', () => {
  const gameboard = gameboardManager.createGameboard();
  const newShip = gameboard.placeShip([0,0], 2, 'horizontal');
  expect(gameboard.grid[0][0].ship).toBe(newShip);
  expect(gameboard.grid[0][1].ship).toBe(newShip);
});

test('Ship placement 4.', () => {
  const gameboard = gameboardManager.createGameboard();
  const newShip = gameboard.placeShip([2,0], 4, 'vertical');
  expect(gameboard.grid[2][0].ship).toBe(newShip);
  expect(gameboard.grid[3][0].ship).toBe(newShip);
  expect(gameboard.grid[4][0].ship).toBe(newShip);
  expect(gameboard.grid[5][0].ship).toBe(newShip);
});

test('Ship placement 3.', () => {
  const gameboard = gameboardManager.createGameboard();
  const newShip = gameboard.placeShip([6,6], 3, 'horizontal');
  expect(gameboard.grid[6][6].ship).toBe(newShip);
  expect(gameboard.grid[6][7].ship).toBe(newShip);
  expect(gameboard.grid[6][8].ship).toBe(newShip);
});

// Test Receive Attack
test('Receive Attack on empty grid.', () => {
  const gameboard = gameboardManager.createGameboard();
  const attackResult = gameboard.receiveAttack([0,0]);
  expect(attackResult.hit).toBe(false);
  expect(attackResult.allSunk).toBe(false);
  expect(gameboard.grid[0][0].attacked).toBe(true);
});

test('Receive Attack on ship grid.', () => {
  const gameboard = gameboardManager.createGameboard();
  const newShip = gameboard.placeShip([7,4], 4, 'horizontal');
  const attackResult = gameboard.receiveAttack([7,5]);
  expect(attackResult.hit).toBe(true);
  expect(attackResult.allSunk).toBe(false);
  expect(gameboard.grid[7][5].attacked).toBe(true);
});

test('Sink the last ship.', () => {
  const gameboard = gameboardManager.createGameboard();
  const newShip = gameboard.placeShip([2,2], 4, 'vertical');
  const attackResult1 = gameboard.receiveAttack([2,2]);
  const attackResult2 = gameboard.receiveAttack([3,2]);
  const attackResult3 = gameboard.receiveAttack([4,2]);
  const attackResult4 = gameboard.receiveAttack([5,2]);
  expect(attackResult1.hit).toBe(true);
  expect(attackResult2.hit).toBe(true);
  expect(attackResult3.hit).toBe(true);
  expect(attackResult4.hit).toBe(true);
  expect(attackResult4.allSunk).toBe(true);
});

test('Random Gameboard Creation.', () => {
  const gameboard = gameboardManager.createGameboard();
  gameboard.randomizeBoard();
  expect(gameboard.ships).toBe(5);
});