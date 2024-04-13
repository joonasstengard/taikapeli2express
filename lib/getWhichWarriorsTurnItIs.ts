import db from "../db";

function getWhichWarriorsTurnItIs(armyId: number): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id
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
          resolve(result[0].id); // Resolve with the ID of the fastest warrior who hasn't moved
        } else {
          resolve(null); // Resolve with null if no such warrior is found
        }
      }
    });
  });
}

export default getWhichWarriorsTurnItIs;
