import db from "../db";
import advanceBattleTurn from "../lib/advanceBattleTurn";
import computerWarriorMovePosition from "../lib/computersActionsInBattle/computerWarriorMovePosition";
import computerWarriorWait from "../lib/computersActionsInBattle/computerWarriorWait";
import fetchWarriorsFromBattleArmies from "../lib/fetchWarriorsFromBattleArmies";
import getEnemyWarriorsInRange from "../lib/getEnemyWarriorsInRange";
import getWhichWarriorsTurnItIs from "../lib/getWhichWarriorsTurnItIs";
import warriorAttacksTile from "../lib/warriorAttacksTile";

// important route, this gets called always when its computers turn

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
        let [warriors]: any = await db
          .promise()
          .query("SELECT * FROM warriors WHERE armyId = ? OR armyId = ?", [
            playersArmyId,
            computersArmyId,
          ]);

        // get the warrior object whose turn it is to move:
        const warriorWhoseTurnItIsToMove = await getWhichWarriorsTurnItIs(
          computersArmyId
        );

        // randomize here what is the computers action
        const rng = Math.random(); // Generate a random number once, 0.0-0.99
        if (rng < 0.3) {
          // just move
          await computerWarriorMovePosition(
            warriors,
            warriorWhoseTurnItIsToMove.id
          );
        } else if (rng < 0.8) {
          // if there are enemy warriors in attack range, try to attack. if not, move
          const enemyWarriorsInAttackRange = await getEnemyWarriorsInRange(
            warriors,
            warriorWhoseTurnItIsToMove.attackRange,
            warriorWhoseTurnItIsToMove.id
          );
          if (enemyWarriorsInAttackRange.length > 0) {
            // attack
            // randomly choose one enemy warrior from the array as target of the attack
            const randomIndex = Math.floor(
              Math.random() * enemyWarriorsInAttackRange.length
            );
            const chosenWarrior = enemyWarriorsInAttackRange[randomIndex];
            warriorAttacksTile(
              chosenWarrior.battleTileCurrent,
              warriorWhoseTurnItIsToMove.id,
              playersArmyId,
              computersArmyId
            );
          } else {
            // move because no enemy warriors in range for attacking
            await computerWarriorMovePosition(
              warriors,
              warriorWhoseTurnItIsToMove.id
            );
          }
        } else {
          await computerWarriorWait(warriors, warriorWhoseTurnItIsToMove.id);
        }

        // after the warrior has taken their move, no matter what they did, always call this:
        const battleObject = await advanceBattleTurn(
          playersArmyId,
          computersArmyId,
          warriorWhoseTurnItIsToMove.id
        );

        // fetch all warriors from both armies at the end
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
