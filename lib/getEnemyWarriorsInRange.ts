function parseTile(tile) {
  const column = tile[0];
  const row = parseInt(tile.slice(1));
  return { column, row };
}

function calculateDistance(tile1, tile2) {
  const columns = ["A", "B", "C", "D", "E", "F"];
  const pos1 = parseTile(tile1);
  const pos2 = parseTile(tile2);
  const colDist = Math.abs(
    columns.indexOf(pos1.column) - columns.indexOf(pos2.column)
  );
  const rowDist = Math.abs(pos1.row - pos2.row);
  return Math.max(colDist, rowDist);
}

// any warrior from any army can use this function to check and return all enemy warriors in range of them
// the range param can be their attack range or spell range for example
async function getEnemyWarriorsInRange(
  allWarriorsOfBattle: any[],
  range: number,
  warriorIdWhoseTurnItIsToMove: number
) {
  try {
    const currentWarrior = allWarriorsOfBattle.find(
      (warrior) => warrior.id === warriorIdWhoseTurnItIsToMove
    );
    if (!currentWarrior) {
      throw new Error("Current warrior not found (never supposed to happen)");
    }
    const enemiesInRange = allWarriorsOfBattle.filter((warrior) => {
      return (
        warrior.armyId !== currentWarrior.armyId &&
        warrior.currentHealth > 0 &&
        calculateDistance(
          warrior.battleTileCurrent,
          currentWarrior.battleTileCurrent
        ) <= range
      );
    });
    return enemiesInRange;
  } catch (error) {
    throw new Error("Error getting warriors in range: " + error.message);
  }
}

export default getEnemyWarriorsInRange;
