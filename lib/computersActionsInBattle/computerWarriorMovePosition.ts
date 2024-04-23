import db from "../../db";

function getRange(stamina) {
  return Math.floor(stamina / 10) + 1;
}

function isValidPosition(
  colIndex,
  rowIndex,
  maxDistance,
  currentColIndex,
  currentRowIndex
) {
  return (
    Math.abs(colIndex - currentColIndex) <= maxDistance &&
    Math.abs(rowIndex - currentRowIndex) <= maxDistance
  );
}

function getRandomPosition(currentPosition, maxDistance, occupiedPositions) {
  // wip: map columns and rows are hardcoded here (width and height of map)
  const columns = ["A", "B", "C", "D", "E", "F"];
  const rows = [1, 2, 3, 4, 5, 6, 7, 8];
  let availablePositions = [];
  const currentColIndex = columns.indexOf(currentPosition[0]);
  const currentRowIndex = parseInt(currentPosition.slice(1)) - 1;

  columns.forEach((col, colIndex) => {
    rows.forEach((row, rowIndex) => {
      let position = `${col}${row}`;
      if (
        !occupiedPositions.includes(position) &&
        isValidPosition(
          colIndex,
          rowIndex,
          maxDistance,
          currentColIndex,
          currentRowIndex
        )
      ) {
        availablePositions.push(position);
      }
    });
  });

  if (availablePositions.length === 0) return currentPosition; // Stay in place if no available moves
  return availablePositions[
    Math.floor(Math.random() * availablePositions.length)
  ];
}

function computerWarriorMovePosition(warriors, warriorId) {
  return new Promise<void>((resolve, reject) => {
    db.query(
      "SELECT battleTileCurrent, currentStamina FROM warriors WHERE id = ?",
      [warriorId],
      (err, results: any) => {
        if (err) {
          reject(err);
        } else if (results.length === 0) {
          reject(new Error("No warrior found with the specified ID"));
        } else {
          const { battleTileCurrent, currentStamina } = results[0];
          const maxDistance = getRange(currentStamina);
          const occupiedPositions = warriors.map(
            (warrior) => warrior.battleTileCurrent
          );
          const newPosition = getRandomPosition(
            battleTileCurrent,
            maxDistance,
            occupiedPositions
          );

          console.log(
            "moving computers warrior with id: " +
              warriorId +
              " to tile: " +
              newPosition
          );

          const sql = `UPDATE warriors SET battleTileCurrent = ?, hasMovedThisRound = 1 WHERE id = ?`;
          db.query(sql, [newPosition, warriorId], (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      }
    );
  });
}

export default computerWarriorMovePosition;
