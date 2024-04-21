import db from "../db";
import advanceBattleTurn from "../lib/advanceBattleTurn";
import fetchWarriorsFromBattleArmies from "../lib/fetchWarriorsFromBattleArmies";

// Moves player's warrior to tile and returns all warriors of the battle
async function movePlayersWarriorToTile(req) {
  const tileId = req.params.tileId;
  const warriorId = parseInt(req.params.warriorId);
  const playersArmyId = parseInt(req.params.playersArmyId);
  const computersArmyId = parseInt(req.params.computersArmyId);

  return new Promise((resolve, reject) => {
    // Start a transaction
    db.beginTransaction(async (err) => {
      if (err) {
        reject(err);
        return;
      }

      // WIP: add a check here to make sure that the player does not try to move past max range, currently
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

          try {
            // After a warrior has taken their move, always call this
            const battleObject = await advanceBattleTurn(
              playersArmyId,
              computersArmyId,
              warriorId
            );

            // fetch all warriors
            const { playersWarriors, computersWarriors } =
              await fetchWarriorsFromBattleArmies(
                playersArmyId,
                computersArmyId
              );

            // Commit transaction
            db.commit((err) => {
              if (err) {
                db.rollback(() => reject(err));
                return;
              }

              // Including both armies' warriors and battleObject in the response
              resolve({
                playersWarriors,
                computersWarriors,
                battleObject,
              });
            });
          } catch (error) {
            db.rollback(() => reject(error));
          }
        }
      );
    });
  });
}

export default movePlayersWarriorToTile;
