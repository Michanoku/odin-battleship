
// Test the creation of the gameboard grid array
test('Gameboard creation.', () => {
  const gameboard = new Gameboard();
  expect(gameboard.grid.length).toBe(10);
  for (const row of gameboard.grid) {
    expect(row.length).toBe(10);
  }
});