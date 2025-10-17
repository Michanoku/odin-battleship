import { Gameboard } from './gameboard.js';

// Test the creation of the gameboard grid array
test('Gameboard creation.', () => {
  const gameboard = new Gameboard();
  expect(gameboard.grid.length).toBe(10);
  for (const row of gameboard.grid) {
    expect(row.length).toBe(10);
  }
});

// Test ship placement
test('Ship placement 2.', () => {
  const gameboard = new Gameboard();
  const newShip = gameboard.placeShip([[0,0],[0,1]]);
  expect(gameboard.grid[0][0].ship).toBe(newShip);
  expect(gameboard.grid[0][1].ship).toBe(newShip);
});