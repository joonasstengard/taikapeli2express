import db from "../db";
import advanceBattleTurn from "../lib/advanceBattleTurn";
import computerWarriorMovePosition from "../lib/computersActionsInBattle/computerWarriorMovePosition";
import warriorWaits from "../lib/warriorWaits";
import fetchWarriorsFromBattleArmies from "../lib/fetchWarriorsFromBattleArmies";
import getSpellsThatComputerWarriorCanCast from "../lib/computersActionsInBattle/getSpellsThatComputerWarriorCanCast";
import getEnemyWarriorsInRange from "../lib/getEnemyWarriorsInRange";
import getWhichWarriorsTurnItIs from "../lib/getWhichWarriorsTurnItIs";
import warriorAttacksTile from "../lib/warriorAttacksTile";
import warriorCastsSpellToTile from "../lib/warriorCastsSpellToTile";

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

        let commentaryLine;
        // randomize here what is the computers action
        const rng = Math.random(); // Generate a random number once, 0.0-0.99
        if (rng < 0.1) {
          // just move
          await computerWarriorMovePosition(
            warriors,
            warriorWhoseTurnItIsToMove.id
          );
          commentaryLine = warriorWhoseTurnItIsToMove.name + " moved.";
        } else if (rng < 0.8) {
          // cast a spell or attack
          // wip: mages never attack atm, make them attack
          // if higher max mana than strength, try to cast a spell
          if (
            warriorWhoseTurnItIsToMove.mana >
            warriorWhoseTurnItIsToMove.strength
          ) {
            const spellsThatWarriorCanCast =
              getSpellsThatComputerWarriorCanCast(warriorWhoseTurnItIsToMove);
            let validTargetWarriorsForSpell = null;
            let successfulSpell = null;
            if (spellsThatWarriorCanCast) {
              for (const spell of spellsThatWarriorCanCast) {
                const warriorsInRange = await getEnemyWarriorsInRange(
                  warriors,
                  spell.spellRange,
                  warriorWhoseTurnItIsToMove.id
                );

                if (warriorsInRange) {
                  validTargetWarriorsForSpell = warriorsInRange;
                  successfulSpell = spell;
                  break; // Exit the loop once a spell with valid targets is found
                }
              }
            }

            if (successfulSpell && validTargetWarriorsForSpell.length > 0) {
              // valid spell + valid targets exist, casting a spell
              // selecting random target for spell from available targets
              let spellTargetWarrior =
                validTargetWarriorsForSpell[
                  Math.floor(Math.random() * validTargetWarriorsForSpell.length)
                ];
              commentaryLine = await warriorCastsSpellToTile(
                spellTargetWarrior.battleTileCurrent,
                successfulSpell.id,
                warriorWhoseTurnItIsToMove.id,
                playersArmyId,
                computersArmyId
              );
            } else {
              // wip: add code for trying to attack before moving, otherwise mages never attack
              // move because no castable spell with valid targets
              await computerWarriorMovePosition(
                warriors,
                warriorWhoseTurnItIsToMove.id
              );
              commentaryLine = warriorWhoseTurnItIsToMove.name + " moved.";
            }
          } else {
            // not casting a spell, trying to attack
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
              commentaryLine = await warriorAttacksTile(
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
              commentaryLine = warriorWhoseTurnItIsToMove.name + " moved.";
            }
          }
        } else {
          await warriorWaits(warriorWhoseTurnItIsToMove.id);
          commentaryLine = warriorWhoseTurnItIsToMove.name + " waited.";
        }

        // after the warrior has taken their move, no matter what they did, always call this:
        const battleObject = await advanceBattleTurn(
          playersArmyId,
          computersArmyId,
          warriorWhoseTurnItIsToMove.id,
          commentaryLine
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
