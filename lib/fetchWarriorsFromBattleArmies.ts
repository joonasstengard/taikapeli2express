import db from "../db";

async function fetchWarriorsFromBattleArmies(
  playersArmyId: number,
  computersArmyId: number
) {
  try {
    // Query to select all warriors from the player's army
    const [playersWarriors]: any = await db
      .promise()
      .query("SELECT * FROM warriors WHERE armyId = ?", [playersArmyId]);

    // Query to select all warriors from the computer's army
    const [computersWarriors]: any = await db
      .promise()
      .query("SELECT * FROM warriors WHERE armyId = ?", [computersArmyId]);

    // Combine warriors from both armies to fetch spells in one go
    const allWarriorIds: number[] = playersWarriors
      .concat(computersWarriors)
      .map((warrior) => warrior.id);
    if (allWarriorIds.length > 0) {
      const [spellsForWarriors]: any = await db.promise().query(
        `
        SELECT ws.warriorId, s.id, s.name, s.description, s.manaCost, s.baseDamageTarget, s.baseHealTarget, s.type 
        FROM warriorspells ws 
        JOIN spells s ON ws.spellId = s.id 
        WHERE ws.warriorId IN (?)`,
        [allWarriorIds]
      );

      // Map spells to their respective warriors
      const spellMap = spellsForWarriors.reduce((acc, spell) => {
        if (!acc[spell.warriorId]) {
          acc[spell.warriorId] = [];
        }
        acc[spell.warriorId].push({
          id: spell.id,
          name: spell.name,
          description: spell.description,
          manaCost: spell.manaCost,
          baseDamageTarget: spell.baseDamageTarget,
          baseHealTarget: spell.baseHealTarget,
          type: spell.type,
        });
        return acc;
      }, {});

      // Attach spells array to each warrior object
      playersWarriors.forEach(
        (warrior) => (warrior.spells = spellMap[warrior.id] || [])
      );
      computersWarriors.forEach(
        (warrior) => (warrior.spells = spellMap[warrior.id] || [])
      );
    } else {
      // If no warriors, assign empty spell arrays
      playersWarriors.forEach((warrior) => (warrior.spells = []));
      computersWarriors.forEach((warrior) => (warrior.spells = []));
    }

    // Return both arrays containing the warriors with their spells
    return {
      playersWarriors,
      computersWarriors,
    };
  } catch (error) {
    console.error("Error fetching warriors from armies: ", error);
    throw new Error("Failed to fetch warriors from armies");
  }
}

export default fetchWarriorsFromBattleArmies;
