import db from "../db";

// this is called after every warriors turn, no matter what they did, for any armies.
// it increments battles round and turn counters and sets the warriors hasMovedThisTurn to 1
// and in the end it fetches and returns the updated battle data for the battle

function advanceBattleTurn(playersArmyId, computersArmyId, warriorId) {
  return new Promise((resolve, reject) => {
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

          const checkAllMovedSql = `
            SELECT COUNT(*) AS notMovedCount
            FROM warriors
            WHERE armyId IN (?, ?) AND hasMovedThisRound = 0`;

          db.query(
            checkAllMovedSql,
            [playersArmyId, computersArmyId],
            (err, result) => {
              if (err) {
                return db.rollback(() => {
                  reject(err);
                });
              }

              // every warrior has moved in the round, resetting their hasMovedThisRound and incrementing round counter of the battle by 1
              if (result[0].notMovedCount === 0) {
                console.log(
                  "every warrior has moved this round, moving on to next round"
                );
                const resetWarriorsSql = `
                UPDATE warriors
                SET hasMovedThisRound = 0
                WHERE armyId IN (?, ?)`;

                db.query(
                  resetWarriorsSql,
                  [playersArmyId, computersArmyId],
                  (err, result) => {
                    if (err) {
                      return db.rollback(() => {
                        reject(err);
                      });
                    }

                    const advanceRoundSql = `
                  UPDATE battles
                  SET round = round + 1
                  WHERE playersArmyId = ? AND computersArmyId = ? AND isCurrentlyHappening = 1`;

                    db.query(
                      advanceRoundSql,
                      [playersArmyId, computersArmyId],
                      (err, result) => {
                        if (err) {
                          return db.rollback(() => {
                            reject(err);
                          });
                        }
                        commitAndFetchBattle(
                          playersArmyId,
                          computersArmyId,
                          resolve,
                          reject
                        );
                      }
                    );
                  }
                );
              } else {
                // there are still warriors left who have not moved this round
                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      reject(err);
                    });
                  }
                  commitAndFetchBattle(
                    playersArmyId,
                    computersArmyId,
                    resolve,
                    reject
                  );
                });
              }
            }
          );
        });
      });
    });
  });
}

function commitAndFetchBattle(playersArmyId, computersArmyId, resolve, reject) {
  db.commit((err) => {
    if (err) {
      return db.rollback(() => {
        reject(err);
      });
    }
    const fetchBattleSql = `
      SELECT * FROM battles
      WHERE playersArmyId = ? AND computersArmyId = ? AND isCurrentlyHappening = 1`;
    db.query(
      fetchBattleSql,
      [playersArmyId, computersArmyId],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]); // Assuming there's always one battle ongoing for the given armies
        }
      }
    );
  });
}

export default advanceBattleTurn;
