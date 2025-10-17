/* Ship Class for Ship Objects:

BattleShip Ships:  (Amount, Name, Size)
1 	Carrier 	5
2 	Battleship 	4
3 	Destroyer 	3
4 	Submarine 	3
5 	Patrol Boat 	2 

Methods or Variables:

length (the ships length) 
HP (same as length at first, going towards 0 if hit) 
Description says number of hits, but going backwards from HP seems simpler
In this thought, its a question if we need length at all....
isSunk (should be a method checking if HP is 0)

hit() function (decreases HP)


Consideration of what methods are commnunicating outside and need testing:
constructur() - receives the desired length of the ship and should set length and HP accordingly.
hit() - receives the info that the ship was hit and should reduce hp by 1
isSunk() - should probably be checked after every hit and returns the info 
to whatever is sending the hit. (the gameboard) 
*/

class Ship {
  constructor(length) {
    this.length = length;
    this.health = length;
  }
}

export { Ship }