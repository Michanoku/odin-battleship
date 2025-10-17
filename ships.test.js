import { Ship } from './ships.js';

// Test Ship Creation
for (let i = 2; i < 6; i ++) {
  test(`Ship creation length ${i}.`, () => {
    const ship = new Ship(i)
    expect(ship.length).toBe(i);
    expect(ship.health).toBe(i);
  });
}

// Test Ship Hit
test('Ship hit.', () => {
  const ship = new Ship(5);
  const sunk = ship.hit();
  expect(ship.health).toBe(4);
  expect(sunk).toBe(false);
});

test('Ship hit.', () => {
  const ship = new Ship(2);
  const sunk1 = ship.hit();
  const sunk2 = ship.hit();
  expect(ship.health).toBe(0);
  expect(sunk2).toBe(true);
});