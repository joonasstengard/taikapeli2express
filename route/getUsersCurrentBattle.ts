import db from "../db";

function getUsersCurrentBattle(req, res): Promise<any> {
    // lisää tänne joskus failsafe mitä tehdä jos ei ole yhtäkään battlea
    // userilla missä isCurrentlyHappening on 1
  try {
    const userId = parseInt(req.params.userId);

    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM battles WHERE userId = ? AND isCurrentlyHappening = 1 ORDER BY id DESC LIMIT 1",
        [userId, userId],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results[0]);
          }
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching current battle");
  }
}

export default getUsersCurrentBattle;
