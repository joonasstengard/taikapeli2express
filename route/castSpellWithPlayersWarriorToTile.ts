import db from "../db";
import advanceBattleTurn from "../lib/advanceBattleTurn";
import fetchWarriorsFromBattleArmies from "../lib/fetchWarriorsFromBattleArmies";
import warriorCastsSpellToTile from "../lib/warriorCastsSpellToTile";

async function castSpellWithPlayersWarriorToTile(req) {
  const tileId = req.params.tileId;
  const spellId = req.params.spellId;
  const warriorId = parseInt(req.params.warriorId);
  const playersArmyId = parseInt(req.params.playersArmyId);
  const computersArmyId = parseInt(req.params.computersArmyId);

  return new Promise((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) {
        reject(err);
        return;
      }

      const castSpellAndFetchWarriors = async () => {
        try {
          await warriorCastsSpellToTile(
            tileId,
            spellId,
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

      castSpellAndFetchWarriors();
    });
  });
}

export default castSpellWithPlayersWarriorToTile;
