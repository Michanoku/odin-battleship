import { cpuPlayer } from './cpu.js';

test('CPU creation.', () => {
  const CPU = new cpuPlayer();
  expect(CPU.name).toBe('CPU');
  expect(CPU.enemyBoard.grid.length).toBe(10);
  for (const row of CPU.enemyBoard.grid) {
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
  CPU.markCell(mockResult, [targetRow, targetCol]);
  const cell = CPU.enemyBoard.grid[targetRow][targetCol];
  expect(cell.attacked).toBe(true);
});

test('Mark impossible.', () => {
  const CPU = new cpuPlayer;
  const mockResult = {hit: false};
  CPU.markCell(mockResult, [4, 5]);
  CPU.markCell(mockResult, [5, 6]);
  CPU.markCell(mockResult, [6, 5]);
  CPU.markCell(mockResult, [5, 4]);
  const cell = CPU.enemyBoard.grid[5][5];
  expect(cell.possible).toBe(false);
});

test('Enter Target Mode.', () => {
  const CPU = new cpuPlayer;
  const mockResult = {hit: true};
  CPU.markCell(mockResult, [5, 5]);
  const cell = CPU.enemyBoard.grid[5][5];
  expect(cell.ship).toBe(true);
  expect(CPU.targetMode).toBe(true);
});