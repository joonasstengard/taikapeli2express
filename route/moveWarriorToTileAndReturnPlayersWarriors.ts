import db from "../db";

function moveWarriorToTileAndReturnPlayersWarriors(req, res) {
  const tileId = req.params.tileId;
  const warriorId = parseInt(req.params.warriorId);

  return new Promise((resolve, reject) => {
    // Start a transaction
    db.beginTransaction(err => {
      if (err) {
        reject(err);
        return;
      }

      // Update warrior's battleTileCurrent
      db.query(
        "UPDATE warriors SET battleTileCurrent = ? WHERE id = ?",
        [tileId, warriorId],
        (error, updateResults) => {
          if (error) {
            db.rollback(() => reject(error));
            return;
          }

          // Select all warriors from armyId 1
          // WIP hard coded armyId 1 supposed to be players army id
          db.query(
            "SELECT * FROM warriors WHERE armyId = 1",
            (error, selectResults) => {
              if (error) {
                db.rollback(() => reject(error));
                return;
              }

              // Commit transaction
              db.commit(err => {
                if (err) {
                  db.rollback(() => reject(err));
                  return;
                }

                resolve(selectResults);
              });
            }
          );
        }
      );
    });
  })
  .then(result => {
    res.status(200).json(result);
  })
  .catch(error => {
    console.error(error);
    res.status(500).send("Error moving warrior to tile");
  });
}

export default moveWarriorToTileAndReturnPlayersWarriors;
