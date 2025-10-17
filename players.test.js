
test('Test player creation.', () => {
  const player = new Player('Michanoku', false);
  expect(player.name).toBe('Michanoku');
  expect(player.cpu).toBe(false);
});