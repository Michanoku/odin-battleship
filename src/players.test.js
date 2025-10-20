import { Player } from './players.js';

// Test player creation
test('Player creation.', () => {
  const player = new Player('Michanoku', false);
  expect(player.name).toBe('Michanoku');
  expect(player.cpu).toBe(false);
});

test('Player creation.', () => {
  const player = new Player('Atom', true);
  expect(player.name).toBe('Atom');
  expect(player.cpu).toBe(true);
});