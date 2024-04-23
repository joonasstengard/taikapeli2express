import db from "../db";

function getWhichWarriorsTurnItIs(armyId: number): Promise<any | null> {
  return new Promise((resolve, reject) => {
    // Select all fields from the warriors table
    const sql = `
      SELECT *
      FROM warriors
      WHERE armyId = ? AND hasMovedThisRound = 0
      ORDER BY speed DESC
      LIMIT 1
    `;

    db.query(sql, [armyId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        const result = results as any[];
        if (result.length > 0) {
          // Resolve with the entire warrior object
          resolve(result[0]);
        } else {
          // Resolve with null if no such warrior is found
          resolve(null);
        }
      }
    });
  });
}

export default getWhichWarriorsTurnItIs;
