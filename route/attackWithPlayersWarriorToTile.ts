import db from "../db";
import advanceBattleTurn from "../lib/advanceBattleTurn";
import fetchWarriorsFromBattleArmies from "../lib/fetchWarriorsFromBattleArmies";
import warriorAttacksTile from "../lib/warriorAttacksTile";

async function movePlayersWarriorToTile(req) {
  const tileId = req.params.tileId;
  const warriorId = parseInt(req.params.warriorId);
  const playersArmyId = parseInt(req.params.playersArmyId);
  const computersArmyId = parseInt(req.params.computersArmyId);

  return new Promise((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) {
        reject(err);
        return;
      }

      const moveAndFetchWarriors = async () => {
        try {
          await warriorAttacksTile(
            tileId,
            warriorId,
            playersArmyId,
            computersArmyId
          );
          const battleObject = await advanceBattleTurn(
            playersArmyId,
            computersArmyId,
            warriorId
          );
          // fetch all warriors
          const { playersWarriors, computersWarriors } =
            await fetchWarriorsFromBattleArmies(playersArmyId, computersArmyId);

          db.commit((err) => {
            if (err) {
              db.rollback(() => {
                reject(err);
              });
            } else {
              resolve({
                playersWarriors,
                computersWarriors,
                battleObject,
              });
            }
          });
        } catch (error) {
          db.rollback(() => {
            reject(error);
          });
        }
      };

      moveAndFetchWarriors();
    });
  });
}

export default movePlayersWarriorToTile;
