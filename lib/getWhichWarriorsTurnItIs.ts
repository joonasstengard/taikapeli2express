import db from "../db";

async function getWhichWarriorsTurnItIs(armyId: number): Promise<any | null> {
  try {
    // Select the warrior whose turn it is
    const sql = `
      SELECT *
      FROM warriors
      WHERE armyId = ? AND hasMovedThisRound = 0 AND currentHealth > 0
      ORDER BY speed DESC
      LIMIT 1
    `;

    const warrior: any = await new Promise((resolve, reject) => {
      db.query(sql, [armyId], (err, results: any) => {
        if (err) {
          reject(err);
        } else {
          const result = results;
          if (result.length > 0) {
            resolve(result[0]);
          } else {
            resolve(null);
          }
        }
      });
    });

    if (!warrior) {
      console.log(
        "trying to fetch a warrior whose turn it is, but none was found,,,"
      );
      return null; // No eligible warrior found
    }

    // Fetch spells for the warrior
    const spells: any[] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT ws.warriorId, s.* FROM spells s
         JOIN warriorspells ws ON s.id = ws.spellId
         WHERE ws.warriorId = ?`,
        [warrior.id],
        (error, results: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });

    // Attach spells to the warrior
    const warriorWithSpells = {
      ...warrior,
      spells: spells,
    };

    return warriorWithSpells;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching warrior whose turn it is");
  }
}

export default getWhichWarriorsTurnItIs;
