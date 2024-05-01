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
      // also add a check of the tile being moved to being empty?

      // Fetch the warrior details from the database
      db.query(
        "SELECT name FROM warriors WHERE id = ?",
        [warriorId],
        async (err, results: any) => {
          if (err) {
            db.rollback(() => reject(err));
            return;
          }

          if (results.length === 0) {
            db.rollback(() => reject(new Error("Warrior not found")));
            return;
          }
          const warriorWhoMoved = results[0];

          // Update warrior's battleTileCurrent
          db.query(
            "UPDATE warriors SET battleTileCurrent = ? WHERE id = ?",
            [tileId, warriorId],
            async (error, updateResults) => {
              if (error) {
                db.rollback(() => reject(error));
                return;
              }

              // commentary line
              const commentaryLine = warriorWhoMoved.name + " moved.";
              try {
                // After a warrior has taken their move, always call this
                const battleObject = await advanceBattleTurn(
                  playersArmyId,
                  computersArmyId,
                  warriorId,
                  commentaryLine
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
        }
      );
    });
  });
}

export default movePlayersWarriorToTile;
