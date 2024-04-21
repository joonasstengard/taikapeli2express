import db from "../db";
import advanceBattleTurn from "../lib/advanceBattleTurn";
import fetchWarriorsFromBattleArmies from "../lib/fetchWarriorsFromBattleArmies";

// Player's warrior waits. Returns all warriors of the battle
async function playersWarriorWaits(req) {
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

      try {
        // Update warrior's hasMovedThisRound
        await db
          .promise()
          .query("UPDATE warriors SET hasMovedThisRound = 1 WHERE id = ?", [
            warriorId,
          ]);

        // After a warrior has taken their move, always call this
        const battleObject = await advanceBattleTurn(
          playersArmyId,
          computersArmyId,
          warriorId
        );

        // fetch warriors
        const { playersWarriors, computersWarriors } =
          await fetchWarriorsFromBattleArmies(playersArmyId, computersArmyId);

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
    });
  });
}

export default playersWarriorWaits;
