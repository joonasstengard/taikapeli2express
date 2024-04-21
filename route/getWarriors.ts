import db from "../db";

async function getWarriors(req, res): Promise<any> {
  try {
    const userId = parseInt(req.params.userId);
    const armyId = parseInt(req.params.armyId);

    // Fetch warriors
    const warriors: any[] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM warriors WHERE userId = ? AND armyId = ?",
        [userId, armyId],
        (error, results:any) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });

    if (warriors.length === 0) {
      return []; // No warriors found
    }

    // Collect all warrior IDs
    const warriorIds = warriors.map((warrior) => warrior.id);

    // Fetch spells for all warriors in one go
    const spells: any[] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT ws.warriorId, s.* FROM spells s
         JOIN warriorspells ws ON s.id = ws.spellId
         WHERE ws.warriorId IN (?)`,
        [warriorIds],
        (error, results:any) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });

    // Map spells to their respective warriors
    const warriorSpellsMap = spells.reduce((acc, spell) => {
      if (!acc[spell.warriorId]) {
        acc[spell.warriorId] = [];
      }
      acc[spell.warriorId].push(spell);
      return acc;
    }, {});

    // Attach spells to each warrior
    const warriorsWithSpells = warriors.map((warrior) => ({
      ...warrior,
      spells: warriorSpellsMap[warrior.id] || [],
    }));

    return warriorsWithSpells;
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching warriors and their spells");
  }
}

export default getWarriors;
