import db from "../db";

function getRandomPosition(occupiedPositions) {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
  const rows = [1, 2, 3, 4, 5, 6, 7, 8];
  let availablePositions = [];

  columns.forEach(col => {
    rows.forEach(row => {
      let position = `${col}${row}`;
      if (!occupiedPositions.includes(position)) {
        availablePositions.push(position);
      }
    });
  });

  return availablePositions[Math.floor(Math.random() * availablePositions.length)];
}

function computerWarriorMovePosition(warriors, warriorId) {
  return new Promise<void>((resolve, reject) => {
    const occupiedPositions = warriors.map(warrior => warrior.battleTileCurrent);
    const newPosition = getRandomPosition(occupiedPositions);

    console.log('moving warrior with id: ' + warriorId + ' to tile: ' + newPosition);

    const sql = `UPDATE warriors SET battleTileCurrent = ?, hasMovedThisRound = 1 WHERE id = ?`;
    
    db.query(sql, [newPosition, warriorId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(); // Resolves without returning data
      }
    });
  });
}

export default computerWarriorMovePosition;
