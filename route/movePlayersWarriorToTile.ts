import db from "../db";
import advanceBattleTurn from "../lib/advanceBattleTurn";

// moves players warrior to tile and returns all warriors of the battle

async function movePlayersWarriorToTile(req) {
  const tileId = req.params.tileId;
  const warriorId = parseInt(req.params.warriorId);
  const playersArmyId = parseInt(req.params.playersArmyId);
  const computersArmyId = parseInt(req.params.computersArmyId);

  return new Promise((resolve, reject) => {
    // Start a transaction
    db.beginTransaction((err) => {
      if (err) {
        reject(err);
        return;
      }

      // wip: add a check here to make sure that the player does not try to move past max range, currently
      // there is only check in UI for the player. computer warriors have their own check

      // Update warrior's battleTileCurrent and hasMovedThisRound
      db.query(
        "UPDATE warriors SET battleTileCurrent = ?, hasMovedThisRound = 1 WHERE id = ?",
        [tileId, warriorId],
        async (error, updateResults) => {
          if (error) {
            db.rollback(() => reject(error));
            return;
          }

          // after a warrior has taken their move, no matter what they did, always call this
          const battleObject = await advanceBattleTurn(
            playersArmyId,
            computersArmyId,
            warriorId
          );

          // Select all warriors from the player's army
          db.query(
            "SELECT * FROM warriors WHERE armyId = ?",
            [playersArmyId], // Using playersArmyId from the request
            (error, playersWarriors) => {
              if (error) {
                db.rollback(() => reject(error));
                return;
              }

              // Select all warriors from the computer's army
              db.query(
                "SELECT * FROM warriors WHERE armyId = ?",
                [computersArmyId], // Using computersArmyId from the request
                (error, computersWarriors) => {
                  if (error) {
                    db.rollback(() => reject(error));
                    return;
                  }

                  // Commit transaction
                  db.commit((err) => {
                    if (err) {
                      db.rollback(() => reject(err));
                      return;
                    }

                    // Including both armies' warriors and battleObject in the response
                    resolve({
                      playersWarriors: playersWarriors,
                      computersWarriors: computersWarriors,
                      battleObject,
                    });
                  });
                }
              );
            }
          );
        }
      );
    });
  });
}

export default movePlayersWarriorToTile;
