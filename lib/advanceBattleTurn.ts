import db from "../db";

// called by functions that handle players or computers turn and
// advance the battle's turnsTaken counter.
// WIP: add advancing round counter here when every warrior has moved in a round
// WIP: and reset every warriors hasMovedThisRound to 0 when round changes

function advanceBattleTurn(warriorId) {
  return new Promise<void>((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) {
        reject(err);
        return;
      }

      const updateBattleSql = `
          UPDATE battles
          SET turnsTaken = turnsTaken + 1
          WHERE (playersArmyId = (
                  SELECT armyId 
                  FROM warriors 
                  WHERE id = ?)
                OR computersArmyId = (
                  SELECT armyId 
                  FROM warriors 
                  WHERE id = ?))
            AND isCurrentlyHappening = 1`;

      db.query(updateBattleSql, [warriorId, warriorId], (err, result) => {
        if (err) {
          return db.rollback(() => {
            reject(err);
          });
        }

        const updateWarriorSql = `
            UPDATE warriors
            SET hasMovedThisRound = 1
            WHERE id = ?`;

        db.query(updateWarriorSql, [warriorId], (err, result) => {
          if (err) {
            return db.rollback(() => {
              reject(err);
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                reject(err);
              });
            }
            resolve();
          });
        });
      });
    });
  });
}

export default advanceBattleTurn;
