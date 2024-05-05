import db from "../db";
import advanceBattleTurn from "../lib/advanceBattleTurn";
import fetchWarriorsFromBattleArmies from "../lib/fetchWarriorsFromBattleArmies";
import warriorWaits from "../lib/warriorWaits";

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

      // waiting function used by everyone, restores health/stamina/mana, maybe more in the future
      await warriorWaits(warriorId);

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
          const warriorWhoWaited = results[0];
          // Generate commentary line using the warrior's name
          const commentaryLine = warriorWhoWaited.name + " waited.";

          try {
            // After a warrior has taken their move, always call this
            const battleObject = await advanceBattleTurn(
              playersArmyId,
              computersArmyId,
              warriorId,
              commentaryLine
            );

            // Fetch warriors
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

export default playersWarriorWaits;
