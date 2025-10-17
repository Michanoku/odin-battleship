import { Gameboard } from './gameboard.js';

// Test the creation of the gameboard grid array
test('Gameboard creation.', () => {
  const gameboard = new Gameboard();
  expect(gameboard.grid.length).toBe(10);
  for (const row of gameboard.grid) {
    expect(row.length).toBe(10);
  }
});

// Test gameboard grid cells
test('Gameboard grid cells.', () => {
  const gameboard = new Gameboard();
  for (const row of gameboard.grid) {
    for (const cell of row) {
      expect(cell).toEqual({attacked: false, ship: null});
    }
  }
});

// Test ship placement
test('Ship placement 2.', () => {
  const gameboard = new Gameboard();
  const newShip = gameboard.placeShip([[0,0],[0,1]]);
  expect(gameboard.grid[0][0].ship).toBe(newShip);
  expect(gameboard.grid[0][1].ship).toBe(newShip);
});

test('Ship placement 4.', () => {
  const gameboard = new Gameboard();
  const newShip = gameboard.placeShip([[2,0],[5,0]]);
  expect(gameboard.grid[2][0].ship).toBe(newShip);
  expect(gameboard.grid[3][0].ship).toBe(newShip);
  expect(gameboard.grid[4][0].ship).toBe(newShip);
  expect(gameboard.grid[5][0].ship).toBe(newShip);
});

test('Ship placement 3.', () => {
  const gameboard = new Gameboard();
  const newShip = gameboard.placeShip([[6,6],[6,8]]);
  expect(gameboard.grid[6][6].ship).toBe(newShip);
  expect(gameboard.grid[6][7].ship).toBe(newShip);
  expect(gameboard.grid[6][8].ship).toBe(newShip);
});

// Test Receive Attack
test('Receive Attack on empty grid.', () => {
  const gameboard = new Gameboard();
  const attackResult = gameboard.receiveAttack([0,0]);
  expect(attackResult).toBe(false);
  expect(gameboard.grid[0][0].attacked).toBe(true);
});

test('Receive Attack on ship grid.', () => {
  const gameboard = new Gameboard();
  const newShip = gameboard.placeShip([[7,4],[7,7]]);
  const attackResult = gameboard.receiveAttack([7,5]);
  expect(attackResult).toBe(true);
  expect(gameboard.grid[7][5].attacked).toBe(true);
});