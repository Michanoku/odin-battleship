import { Ship } from './ships.js';

// Test Ship Creation
for (let i = 2; i < 6; i ++) {
  test(`Ship creation length ${i}.`, () => {
    const ship = new Ship(i)
    expect(ship.length).toBe(i);
    expect(ship.health).toBe(i);
  });
}
