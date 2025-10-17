import { Ship } from './ships.js';

// Test Ship Creation
for (let i = 2; i < 6; i ++) {
  test(`Ship creation length ${i}.`, () => {
    const ship = new Ship(i)
    expect(ship.health).toBe(i);
  });
}

// Test Ship Hit
test('Ship hit.', () => {
  const ship = new Ship(5);
  ship.hit();
  const sunk = ship.isSunk();
  expect(ship.health).toBe(4);
  expect(sunk).toBe(false);
});

test('Ship sunk.', () => {
  const ship = new Ship(2);
  ship.hit();
  ship.hit();
  const sunk = ship.isSunk();
  expect(ship.health).toBe(0);
  expect(sunk).toBe(true);
});