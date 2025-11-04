# odin-battleship
The Odin Project Battleship 

## Overview

WRITE OVERVIEW HERE

## Modules

### ships.js

This module handles everything to do with ships.

#### Classes

##### Ship

This is a very simple class representing a players ship on the board. Ships do not save any information of who they belong to or where they are placed. This is handled by the gameboard instead.

**Constructor:**

```js
constructor(length) {
  this.health = length;
}
```
 
**Properties:**

- `health`: The health value of the ship, initially considered the same as it's length.

**Key Methods:**

- `hit()`: Reduces the ship's health by 1.
- `isSunk()`: Checks if the ship's health has been reduced to 0 and returns true or false.

### gameboard.js

This module handles the creation of the gameboard and everything that happens to and on the gameboard.

#### Classes

##### Gameboard

The class that handles the gameboard. It can place ships, manually or automatically, and keep track of where they are. It also keeps track of how many ships there are and how many have been sunk, effectively checking the status of the game. When a player makes an attack, the gameboard receives the coordinates and handles the attack and the results.

**Constructor:**

```js
constructor(ships = null) {
  this.grid = Array.from({ length: 10 }, (_, i) =>
    Array.from({ length: 10 }, (_, j) => new Cell([i, j]))
  );
  this.ships = 0;
  this.sunkShips = 0;

  if (ships) {
    if (ships === 'random') {
      this.randomizeBoard();
    } else {
      for (const ship in ships) {
        const {coord, size, direction} = ships[ship]; 
        this.placeShip(coord, size, direction);
      }
    }
  }
}
```
 
**Properties:**

- `grid`: An array of 10 arrays that hold 10 cells each to form a grid that holds cells.
- `ships`: The amount of ships on the board. 
- `sunkShips`: The amount of ships that have been sunk.

**Key Methods:**

- `placeShip()`: Places a ship on the gameboard. Returns the ship  if placed or null if the ship could not be placed.
- `simulateRandomPlacement()`: Simulates a mock gameboard to return possible placements to render in the interface before the user decides their board.
- `receiveAttack()`: Receives an attack on the gameboard. Marks the cell as attacked and returns feedback on hit or miss, or if all ships are sunk.

##### Cell

This class handles the information for each cell on the gameboard. Cells save their coordinates as well as their status, if they have been previously targeted. They also keep a reference to any ships possibly on them. In addition, to make placement easier, cells will keep an integer of the space below and to the right of themselves up to 4 cells. 

Cells also report back on available space if a ship was to be placed on them. 

**Constructor:**

```js
constructor(coords) {
  this.coords = coords;
  this.attacked = false;
  this.ship = null;
  this.horizontal = this.initialize("horizontal", coords);
  this.vertical = this.initialize("vertical", coords);
}
```
 
**Properties:**

- `coords`: The coordinate array for the cell. For example: [0, 0]
- `attacked`: A boolean to show whether the cell has been attacked or not.
- `ship`: A reference to the ship object that partly occupies the cell. Null if no ship is present.
- `horizontal`: The number of free cells to the right of this cell.
- `vertical`: The number of free cells to the bottom of this cell.

**Key Methods:**

- `initialize()`: Calculates the horizontal and vertical free space on cell creation. Since the grid size is 0 - 9, any cell near the right or bottom edges have less space from the start.
- `hasSpace()`: Takes the ship size as argument and checks if there is free space in any direction. Returns all directions with free space or an empty array if no space is available.

#### Module Functions

- `createGameboard()`: Creates and returns a new gameboard with optional placed ships.
- `randomPlacement()`: Creates a mock gameboard and simulates random placement of ships to return to the interface for the user to consider.

### players.js

The module that handles human players. 

#### Classes

##### Player

The player class is a simple class that saves the players name and their gameboard. It only serves to associate these two things. 

**Constructor:**

```js
constructor(name, ships) {
  this.gameboard = createGameboard(ships);
  this.name = name;
}
```
 
**Properties:**

-`gameboard`: A reference to the gameboard created by the gameboard module and associated with the player.
- `name`: The players name.

### gameflow.js

This module handles the different phases of the game and the state of the game at any point. It coordinates the different modules and instructs the interface module to update the DOM when needed. It also listens for events from the interface module to handle data
coming from player input. 

**Key Functions:**

- `addPlayer()`: Adds a human or cpu player to the players array. 
- `start()`: Starts the game setup by adding event listeners and instructing the interface module to initialize the game.
- `takeTurns()`: Starts the turn phase by adding event listeners waiting for players to start or end their turn, or attack the other player. Also instructs the interface module to start the first turn. 
- `waitForPlayers()`: Adds an event listener to wait for player data to be received from the interface module. It will call addPlayer() for each received player and then call takeTurns() to start the turn phase.
- `waitForReset()`: Adds an event listener to wait for the player to start a new game. Resets the game state and calls the interface module to initialize the game again.
- `waitForRandomPlacement()`: Adds an event listener to wait for the player to randomize ship placement on the setup board. Calls the gameboard module to get random placement for ships and instructs the interface module to place them.
- `waitforStart()`: Adds an event listener to wait for a player to start their turn. Instructs the interface to start the turn while handing the current state of the game.
- `waitForAttack()`: Adds an event listener to wait for a player to attack the other player. Will receive coordinates in the detail of the event and uses the receiving players gameboard to handle the attack. Instructs the interface module to handle the results of the attack visually.
- `waitForEnd()`: Adds an event listener to wait for a player to end their turn. Changes to the next turn. If the next player is a CPU, it instructs the CPU to pick a cell to attack, then instructs the human players gameboard to handle the attack. It then passes the result back to the CPU so the CPU can calculate their next possible moves, and instructs the interface module to handle the results of the attack visually.

**Key Variables:**

- `state`: A const object saving the players to an array and keeping track of what turn it is. It also saves a boolean once the game has been initialized (to prevent double initialization on reset or restart).

### cpu.js

The module that handles cpu players. Contains special a special gameboard with special cells in addition to the CPUPlayer class.

#### Classes

##### CPUPlayer

This is the class that handles cpu actions. It defaults to the name 'CPU' and has a gameboard just like a human player, but the gameboard is random. It also has additional attributes. A special gameboard it uses to look for and attack the human players ships, a targetMode that gets activated once a ship has been found as well as the gathered information about the ship it is currently targeting. 

**Constructor:**

```js
constructor() {
  this.name = 'CPU';
  this.targetMode = false;
  this.targetShip = {};
  this.gameboard = createGameboard('random');
  this.targetBoard = new TargetGameboard();
}
```
 
**Properties:**

- `name`: The CPU players name. Defaults to CPU.
- `targetMode`: A boolean. Defaults to false.
- `targetShip`: The object representing the current targetMode targetShip. Empty at first.
- `gameboard`: A reference to the gameboard created by the gameboard module and associated with the cpu player.
- `targetBoard`: A special gameboard used by the CPU to track their own actions. 

**Key Methods:**

- `attackCell()`: Will return the next coordinate the CPU player is going to attack. If the CPU player is in target mode, analyzeTarget is called to mark potential targets. Then, targetBoard.getTargetCell is called to ask the targetBoard to provide a cell to attack. If no cell is returned, targetMode is ended and the function is called again. If the CPU player is not in target mode, targetBoard.getHuntCell is called to ask the targetBoard to provide a cell to attack. The function returns a cell to attack.
- `analyzeTarget()`: This function will adjust targetShip attribute values according to the current data. If there are more than 2 hits recorded in the current target, and the likely direction of the ship has not been estimated, the function will estimate horizontal or vertical. Then, the coordinates will be sorted. No matter how many hits there are, the internal #markPotential function is called to mark potential cells to hit. 
- `getAttackResults()`: This function is called after an attack has happened, so the CPU player can understand the results. First, targetBoard.markAttack is called to record the attack. If a hit was reported, the CPU player will either enter target mode or add the coordinates to the current target (if already in target mode). If the current target has been reported as branched (if we have recorded more hits than the allowed length of the longest ship), then these coordinates will show us where the targets branch, so the point is calculated. After that, the targetBoard.updateMap method is called to analyze the map for new, impossible locations. 

##### TargetGameboard

This class handles the grid that the CPU player uses to attack and analyze their hits and misses. 

**Constructor:**

```js
constructor() {
  this.grid = Array.from({ length: 10 }, (_, i) =>
    Array.from({ length: 10 }, (_, j) => new TargetCell([i, j]))
  );
}
```
 
**Properties:**

- `grid`: An array of 10 arrays that hold 10 cells each to form a grid that holds cells.

**Key Methods:**

- `updateMap()`: Checks each cell of the grid. Marks them as possible = false if all surrounding cells are either edges or misses. 
- `removePotential()`: Takes an array of coordinates, gets the surrounding cells, and sets their potential to false along the desired direction. This is used, for example, when a ship has been found to be horizontal, so the vertical potential cells are set to false to keep checking horizontal first.
- `addPotential()`: The opposite of removePotential, sets potential to true for cells surrounding the given coordinates that are likely targets.
- `checkEdgePotential()`: If a ship was too big (6 or more) but all cells along the ships direction have been exhausted, edge cells in the other direction are checked. (around the first and last cell in a hit array) If any cells exist that are yet to be attacked, they will have their potential set to true.
- `markSingle()`: After the first hit of a target, all surrounding possible cells are marked as potential targets.
-`markAttack()`: Once a cell has been attacked, it will be marked as attacked. If a hit was reported, ship will be set to true, and potential to false (as there is no longer a need to attack the cell).
-`getHuntCell()`: Creates an array of all possible cells to hunt in a pattern (so the CPU doesn't keep trying adjacent cells). Returns a random cell from that array.
-`getTargetCell()`: Creates an array of all cells that are set to potential = true. Returns null if there are none, or a random cell from the array.

#### Classes

##### TargetCell

A special cell class for the targetboard. Saves the cpu players analysis and records attacks and hits.

**Constructor:**

```js
  constructor(coords) {
    this.coords = coords;
    this.attacked = false;
    this.ship = false;
    this.potential = false;
    this.possible = true;
  }
```
 
**Properties:**

- `coords`: The coordinate array for the cell. For example: [0, 0].
- `attacked`: Whether the cell has previously been attacked or not.
- `ship`: Whether a ship was found or not.
- `potential`: Whether the cell was marked as a potential location for a ship based on the current target mode.
- `possible`: Whether the cell can even hold a ship. 

**Key Methods:**

-`noHunt()`: If the cell has been attacked or is marked possible = false, do not select it when hunting. Returns true if it should be skipped.

### interface.js

This module handles all event listeners for the DOM, as well as changes in the DOM, rerenders, and user inputs in the DOM. Handles user input data back to the gameflow module via event listeners. 

**Key Functions:**

-`initializeGame()`: Calls several other functions to initialize the DOM and create needed DOM objects.
-`createStars()`: Creates a random starry background for both player gameboards.
-`addListeners()`: Adds all event listeners needed for elements of the DOM.
-`createSetupBoard()`: Creates the board the player uses to place their ships. 
-`createShipSelection()`: Creates the ship selection the player uses to select, rotate and drag the ships.
-`newGame()`: Allows the player to start a new game. It sets everything back to default. 
-`resetBoard()`: Resets the players placed ships to allow them to start over. 
-`callRandomizer()`: Sends an event to be picked up by gameflow to use existing methods to randomize ship locations on the board.
-`confirmPlayer()`: Used when a player has finished and confirmed their setup. Saves either the human players setup to the state.players array or marks the player as CPU. Once both players have been added, dispatches an event for gameflow to save the players in the game state and start the game.
-`selectShip()`: Used when a player clicks on a ship in the selection. The ship will be marked and the name displayed.
-`rotateShip()`: Used when the player double clicks on a ship in the selection. The ship will rotate to horizontal or vertical.
-`dragShip()`: Used when the player drags a ship in the selection. The data will be saved to the dragData object and createGhost will be called to create a ghost image to visualize the drag. 
-`createGhost()`: Creates a ghost of the size and direction of the current ship. The ghost can be used to replace the default drag image.
-`dropShip()`: Used when the player drops a ship into a location on the setup board. If the location is occupied or there is not enough space in the players chosen location, the drop will be rejected. Otherwise the ship will be placed and the select ship removed from the selection. 
-`randomizeShips()`: Will place all ships that were returned by the gameflow after requesting a manual placement. 
-`turn()`: Depending on whether it's the first turn, or the start or end of a turn, different DOM objects need to be visible and different announcements have to be made. This function handles the correct visuals and announcements.
-`registerAttack()`: When an attack has happened and the results returned, an understandable announcement is created and the specific gameboard re-rendered. This function also checks whether the game is over or not and will end it if so.
-`createGameboard()`: Creates the visible gameboard out of the gameboard data. Depending on whether the gameboard belongs to the current player or the 'enemy', different things will be displayed. (After all, we don't want to see the other player's ships if we have not found them yet)
-`clickCell()`: Used when the player clicks on a cell in their turn. Will update the current target coordinates if the cell is valid and show visual confirmation of the cell that is about to be attacked. If the cell is valid, the fire button is released.

**Key Variables:**

-`dragData`: When the player starts dragging a ship, details about the ship are saved to drag data, namely the ship type, the direction the ship was rotated to and the size. This data is used to drop the correct ship.
-`setupData`: Used to collect the player names and their ship placements to eventually hand over to the gameflow object once the players have finished their setup. 
-`state`: Keeps track of the current clicked cell coordinates (as attackTarget), whether the turn is currently in the end phase and whether the game has finished initializing once (to prevent double event listeners)

## Notes

About the flow of the game:

The game can be played against another human or against the CPU.

When the game is played with 2 people, after every round the current player has to confirm the end of their round. This hides all gameboards and will show a confirmation for the next player to start their turn. This is used so the players can take turns on the same computer without seeing each other's ships.
I also opted for a 'Fire' button to prevent accidental attacking when clicking a cell. The player can 
confirm their target and commit with the button. 

About the CPU player:

The CPU player has two default modes of operation. Hunt mode or attack mode. When in hunt mode, the CPU player will randomly target one cell from an array. The possible cells use a pattern so the CPU doesn't waste any attempts on too many adjacent cells. When in target mode, the CPU is actively looking to hit
an already found target. It is activated once the CPU hits a ship during hunt mode. The target mode
will continue until all options of possible adjacent cells with ships have been exhausted. It will try
to find adjacent ships if it finds that it has hit more than 5 targets. The CPU will  build their own targetboard based on their previous attacks, and will analyze it for possible locations before each attack attempt. It's completely separated from the players gameboard so it can't cheat in any way. 

## Thoughts

Limitations in visible fidelity:

During creation of the game I wanted to opt for more visually interesting ships. I tried my hand at
some pixel art but realized quickly that it looked jarring in comparison to the rest of the game's
layout. I gave up on having nicer ships in favor of a more simple approach with colored cells.
If revisited, this could be improved on to have nicer visual feedback for ships and hits.

Limitations of the CPU player:

Currently, the CPU player will randomly attack cells in a pattern until it finds a ship, upon which 
it will very effectively try to ascertain potential adjacent cells to attack. This works very well for one ship. Once two hits have been registered, the CPU will calculate the ships direction and will prioritize attacks along that axis. If there are 5 or less hits along this attacks.  TO DO

Logging: