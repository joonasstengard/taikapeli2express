import db from "../db";
import advanceBattleTurn from "../lib/advanceBattleTurn";
import computerWarriorMovePosition from "../lib/computersActionsInBattle/computerWarriorMovePosition";
import computerWarriorWait from "../lib/computersActionsInBattle/computerWarriorWait";
import fetchWarriorsFromBattleArmies from "../lib/fetchWarriorsFromBattleArmies";
import getWhichWarriorsTurnItIs from "../lib/getWhichWarriorsTurnItIs";

async function computersWarriorsTurn(req) {
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
        // fetching and combining all the warriors from both armies at the start
        let [warriors] = await db
          .promise()
          .query("SELECT * FROM warriors WHERE armyId = ? OR armyId = ?", [
            playersArmyId,
            computersArmyId,
          ]);

        // get the warriorId whose turn it is to move:
        const warriorIdWhoseTurnItIsToMove = await getWhichWarriorsTurnItIs(
          computersArmyId
        );

        // randomize here what is the computers action
        const rng = Math.random(); // Generate a random number once, 0.0-0.99
        if (rng < 0.75) {
          await computerWarriorMovePosition(
            warriors,
            warriorIdWhoseTurnItIsToMove
          );
        } else {
          await computerWarriorWait(warriors, warriorIdWhoseTurnItIsToMove);
        }

        // after the warrior has taken their move, no matter what they did, always call this:
        const battleObject = await advanceBattleTurn(
          playersArmyId,
          computersArmyId,
          warriorIdWhoseTurnItIsToMove
        );

        // Using the new function to fetch all warriors from both armies at the end
        const { playersWarriors, computersWarriors } =
          await fetchWarriorsFromBattleArmies(playersArmyId, computersArmyId);

        db.commit();
        resolve({
          playerArmyWarriors: playersWarriors,
          computerArmyWarriors: computersWarriors,
          battleObject,
        });
      } catch (error) {
        db.rollback(() => reject(error));
      }
    });
  });
}

export default computersWarriorsTurn;
