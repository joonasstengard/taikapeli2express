import db from "../db";

function getArmy(req, res): Promise<any> {
  try {
    const userId = parseInt(req.params.userId);
    const armyId = parseInt(req.params.armyId);

    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM armies WHERE id = ? AND userId = ?",
        [armyId, userId],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching army");
  }
}

export default getArmy;
