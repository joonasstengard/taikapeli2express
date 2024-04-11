import db from "../db";
import computerWarriorMovePosition from "../lib/computerWarriorMovePosition";

async function computersWarriorsTurn(req) {
  const playerArmyId = parseInt(req.params.playerArmyId);
  const computerArmyId = parseInt(req.params.computerArmyId);
  const warriorId = parseInt(req.params.warriorId);

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
            playerArmyId,
            computerArmyId,
          ]);

        // call computerWarriorMovePosition here
        await computerWarriorMovePosition(warriors, warriorId);

        // fetching all the warriors from both armies at the end
        const [playerArmyWarriors] = await db
          .promise()
          .query("SELECT * FROM warriors WHERE armyId = ?", [playerArmyId]);

        const [computerArmyWarriors] = await db
          .promise()
          .query("SELECT * FROM warriors WHERE armyId = ?", [computerArmyId]);

        db.commit();
        resolve({ playerArmyWarriors, computerArmyWarriors });
      } catch (error) {
        db.rollback(() => reject(error));
      }
    });
  });
}

export default computersWarriorsTurn;
