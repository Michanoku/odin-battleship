import { cpuPlayer } from './cpu.js';

test('CPU creation.', () => {
  const CPU = new cpuPlayer();
  expect(CPU.name).toBe('CPU');
  expect(CPU.targetBoard.grid.length).toBe(10);
  for (const row of CPU.targetBoard.grid) {
    expect(row.length).toBe(10);
  };
  expect(CPU.targetMode).toBe(false);
  expect(CPU.gameboard.ships).toBe(5);
});

test('Hunt Targeting.', () => {
  const CPU = new cpuPlayer;
  const [targetRow, targetCol] = CPU.attackCell();
  expect((targetRow + targetCol) % 2).toBe(0);
});

test('Miss.', () => {
  const CPU = new cpuPlayer;
  const [targetRow, targetCol] = CPU.attackCell();
  const mockResult = {hit: false};
  CPU.getAttackResults(mockResult, [targetRow, targetCol]);
  const cell = CPU.targetBoard.grid[targetRow][targetCol];
  expect(cell.attacked).toBe(true);
});

test('Mark impossible.', () => {
  const CPU = new cpuPlayer;
  const mockResult = {hit: false};
  CPU.getAttackResults(mockResult, [4, 5]);
  CPU.getAttackResults(mockResult, [5, 6]);
  CPU.getAttackResults(mockResult, [6, 5]);
  CPU.getAttackResults(mockResult, [5, 4]);
  const cell = CPU.targetBoard.grid[5][5];
  expect(cell.possible).toBe(false);
});

test('Enter Target Mode.', () => {
  const CPU = new cpuPlayer;
  const mockResult = {hit: true};
  CPU.getAttackResults(mockResult, [5, 5]);
  const cell = CPU.targetBoard.grid[5][5];
  expect(cell.ship).toBe(true);
  expect(CPU.targetMode).toBe(true);
});

test('Mark potential in field.', () => {
  const CPU = new cpuPlayer;
  const mockHit = {hit: true};
  CPU.getAttackResults(mockHit, [5, 5]);
  CPU.analyzeTarget();
  expect(CPU.targetBoard.grid[4][5].potential).toBe(true);
  expect(CPU.targetBoard.grid[5][6].potential).toBe(true);
  expect(CPU.targetBoard.grid[6][5].potential).toBe(true);
  expect(CPU.targetBoard.grid[5][4].potential).toBe(true);
  const mockMiss = {hit: false};
  CPU.getAttackResults(mockMiss, [4, 5]);
  expect(CPU.targetBoard.grid[4][5].potential).toBe(false);
});

test('Mark potential in corner.', () => {
  const CPU = new cpuPlayer;
  const mockHit = {hit: true};
  CPU.getAttackResults(mockHit, [0, 0]);
  CPU.analyzeTarget();
  expect(CPU.targetBoard.grid[1][0].potential).toBe(true);
  expect(CPU.targetBoard.grid[0][1].potential).toBe(true);
});

test('Mark potential with existing.', () => {
  const CPU = new cpuPlayer;
  const mockMiss = {hit: false};
  CPU.getAttackResults(mockMiss, [4, 5]);
  CPU.getAttackResults(mockMiss, [6, 5]);
  const mockHit = {hit: true};
  CPU.getAttackResults(mockHit, [5, 5]);
  CPU.analyzeTarget();
  expect(CPU.targetBoard.grid[4][5].potential).toBe(false);
  expect(CPU.targetBoard.grid[5][6].potential).toBe(true);
  expect(CPU.targetBoard.grid[6][5].potential).toBe(false);
  expect(CPU.targetBoard.grid[5][4].potential).toBe(true);
});

test('Mark potential with 2 and get direction.', () => {
  const CPU = new cpuPlayer;
  const mockHit = {hit: true};
  CPU.getAttackResults(mockHit, [5, 5]);
  CPU.analyzeTarget();
  CPU.getAttackResults(mockHit, [5, 6]);
  CPU.analyzeTarget();
  expect(CPU.targetBoard.grid[6][5].potential).toBe(false);
  expect(CPU.targetBoard.grid[4][5].potential).toBe(false);
  expect(CPU.targetBoard.grid[6][6].potential).toBe(false);
  expect(CPU.targetBoard.grid[4][6].potential).toBe(false);
  expect(CPU.targetBoard.grid[5][4].potential).toBe(true);
  expect(CPU.targetBoard.grid[5][7].potential).toBe(true);
});

test('End target mode and return to hunt mode.', () => {
  const CPU = new cpuPlayer;
  const mockHit = {hit: true};
  CPU.getAttackResults(mockHit, [5, 5]);
  CPU.analyzeTarget();
  CPU.getAttackResults(mockHit, [5, 6]);
  CPU.analyzeTarget();
  const mockMiss = {hit: false};
  // Let the CPU decide which cell to pick
  const coords1 = CPU.attackCell();
  CPU.getAttackResults(mockMiss, coords1);
  expect(CPU.targetMode).toBe(true);
  const coords2 = CPU.attackCell();
  CPU.getAttackResults(mockMiss, coords2);
  const coords3 = CPU.attackCell();
  expect(CPU.targetMode).toBe(false);
});

test.only('Hit 6 targets and have the CPU try a branch', () => {
  const CPU = new cpuPlayer;
  const mockHit = {hit: true};
  CPU.getAttackResults(mockHit, [5, 2]);
  CPU.getAttackResults(mockHit, [5, 3]);
  CPU.getAttackResults(mockHit, [5, 4]);
  CPU.getAttackResults(mockHit, [5, 5]);
  CPU.getAttackResults(mockHit, [5, 6]);
  CPU.analyzeTarget();
  expect(CPU.targetShip.branch).toBe(false);
  expect(CPU.targetShip.direction).toBe('horizontal');
  expect(CPU.targetShip.branchPoint).toBe(null);
  // At this point we have reached maximum length, add one more coordinate
  CPU.getAttackResults(mockHit, [5, 7]);
  // There should be only 2 viable coordinates now, 5, 1 and 5, 8
  const mockMiss = {hit: false};
  const coords1 = CPU.attackCell();
  expect(
    JSON.stringify(coords1) === JSON.stringify([5, 1]) ||
    JSON.stringify(coords1) === JSON.stringify([5, 8])
  ).toBe(true);
  CPU.getAttackResults(mockMiss, coords1);
  const coords2 = CPU.attackCell();
  expect(
    JSON.stringify(coords1) === JSON.stringify([5, 1]) ||
    JSON.stringify(coords1) === JSON.stringify([5, 8])
  ).toBe(true);
  CPU.getAttackResults(mockMiss, coords2);
  const coords3 = CPU.attackCell();
  // Now the CPU should have realized we are branching and add the following coordinates:
  // 6, 2 | 4, 2 | 6, 7 | 4, 7
  // Also, branch should be active
  expect(
    JSON.stringify(coords3) === JSON.stringify([6, 2]) ||
    JSON.stringify(coords3) === JSON.stringify([4, 2]) ||
    JSON.stringify(coords3) === JSON.stringify([6, 7]) ||
    JSON.stringify(coords3) === JSON.stringify([4, 7])
  ).toBe(true);
  expect(CPU.targetShip.branch).toBe(true);
  // Now let 3 of the 4 coordinates miss and hit the 6th, activating branch calculation
  CPU.getAttackResults(mockMiss, coords3);
  const coords4 = CPU.attackCell();
  CPU.getAttackResults(mockMiss, coords4);
  const coords5 = CPU.attackCell();
  CPU.getAttackResults(mockMiss, coords5);
  const coords6 = CPU.attackCell();
  CPU.getAttackResults(mockHit, coords6);
  // Now CPU should have saved the branch point
  expect(CPU.targetShip.branchPoint).toBe(coords6);
  // Now with the branch point known the only viable hit would be next to coords 6, below or above
  const coords7 = CPU.attackCell();
  const [row6, col6] = coords6;
  expect([[row6 - 1, col6], [row6 + 1, col6]]).toContainEqual(coords7);
  expect(CPU.targetShip.direction).toBe('vertical');
  expect(CPU.targetShip.branch).toBe(false);
  expect(CPU.targetShip.branchPoint).toBe(null);
});