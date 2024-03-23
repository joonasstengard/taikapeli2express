import db from '../db';

function getWarriors(userId: number, armyId: number): Promise<any> {
  console.log('fetching warriors');

  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM warriors WHERE userId = ? AND armyId = ?', [userId, armyId], (error, results) => {
      if (error) {
        reject(error);
      } else {
        console.log(results);
        resolve(results);
      }
    });
  });
}


export default getWarriors;