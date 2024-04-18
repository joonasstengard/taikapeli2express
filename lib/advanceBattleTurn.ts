import { RowDataPacket } from "mysql2";
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

      // Check the health of all warriors in both armies to see if one army has won
      const checkHealthSql = `
        SELECT armyId, COUNT(*) AS aliveCount
        FROM warriors
        WHERE (armyId IN (?, ?) AND currentHealth > 0)
        GROUP BY armyId`;

      db.query(
        checkHealthSql,
        [playersArmyId, computersArmyId],
        (err, results) => {
          if (err) {
            return db.rollback(() => {
              reject(err);
            });
          }

          // Initialize alive counts
          const aliveCounts = {
            [playersArmyId]: 0,
            [computersArmyId]: 0,
          };
          (results as RowDataPacket[]).forEach((result) => {
            aliveCounts[result.armyId] = result.aliveCount;
          });

          // wip: no draws yet
          // ----

          if (aliveCounts[playersArmyId] === 0) {
            // Declare computersArmy as the winner
            updateWinner(
              computersArmyId,
              playersArmyId,
              computersArmyId,
              resolve,
              reject
            );
          } else if (aliveCounts[computersArmyId] === 0) {
            // Declare playersArmy as the winner
            updateWinner(
              playersArmyId,
              playersArmyId,
              computersArmyId,
              resolve,
              reject
            );
          }

          // Proceed with the battle turn
          const updateBattleSql = `
          UPDATE battles
          SET turnsTaken = turnsTaken + 1
          WHERE playersArmyId = ? AND computersArmyId = ? AND isCurrentlyHappening = 1`;

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

                  // Check if every warrior has moved
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
        }
      );
    });
  });
}

export default advanceBattleTurn;

function updateWinner(
  winnerId,
  playersArmyId,
  computersArmyId,
  resolve,
  reject
) {
  const declareWinnerSql = `
    UPDATE battles
    SET winningArmyId = ?
    WHERE playersArmyId = ? AND computersArmyId = ? AND isCurrentlyHappening = 1`;

  console.log("army with the id of: " + winnerId + " has won the battle!");

  db.query(
    declareWinnerSql,
    [winnerId, playersArmyId, computersArmyId],
    (err, result) => {
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
        // After committing the transaction, fetch the updated battle details
        fetchBattleData(playersArmyId, computersArmyId, resolve, reject);
      });
    }
  );
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
          resolve(results[0]);
        }
      }
    );
  });
}

function fetchBattleData(playersArmyId, computersArmyId, resolve, reject) {
  const fetchBattleSql = `
    SELECT * FROM battles
    WHERE playersArmyId = ? AND computersArmyId = ? AND isCurrentlyHappening = 1`;
  db.query(fetchBattleSql, [playersArmyId, computersArmyId], (err, results) => {
    if (err) {
      reject(err);
    } else {
      resolve(results[0]);
    }
  });
}
