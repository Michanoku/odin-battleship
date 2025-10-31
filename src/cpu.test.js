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