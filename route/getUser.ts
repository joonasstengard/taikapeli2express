import db from "../db";

function getWarriors(req, res): Promise<any> {
  try {
    const userId = parseInt(req.params.userId);

    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE id = ?",
        [userId],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            console.log(results);
            resolve(results);
          }
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching user");
  }
}

export default getWarriors;
