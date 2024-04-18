import db from "../db";

async function warriorAttacksTile(
  tileId: string,
  attackingWarriorId: number,
  playersArmyId: number,
  computersArmyId: number
) {
  try {
    // Query to find defenders on the specified tile from either the player's or computer's army
    const queryDefender = `
        SELECT id, currentHealth, name
        FROM warriors
        WHERE battleTileCurrent = ?
          AND (armyId = ? OR armyId = ?)`;
    const [defenders] = await db
      .promise()
      .query<any[]>(queryDefender, [tileId, playersArmyId, computersArmyId]);

    // Check if defenders exist
    if (defenders.length === 0) {
      throw new Error(
        "No defending warrior found on the specified tile with the given army IDs."
      );
    }
    const defender = defenders[0];

    // Query to find the attacking warrior's strength
    const queryAttacker = `
        SELECT strength, name
        FROM warriors
        WHERE id = ?`;
    const [attackers] = await db
      .promise()
      .query<any[]>(queryAttacker, [attackingWarriorId]);

    // Check if attacker exists
    if (attackers.length === 0) {
      throw new Error("Attacking warrior not found.");
    }
    const attacker = attackers[0];

    // Calculate new health for the defender
    const newHealth = Math.max(defender.currentHealth - attacker.strength, 0); // Ensure health does not go below zero

    // Update defender's health in the database
    const updateQuery = `
        UPDATE warriors
        SET currentHealth = ?
        WHERE id = ?`;
    await db.promise().query(updateQuery, [newHealth, defender.id]);

    console.log(
      "Warrior " +
        attacker.name +
        " attacked " +
        defender.name +
        " successfully, new health: " +
        newHealth
    );
  } catch (error) {
    console.error("Error during attack:", error.message);
  }
}

export default warriorAttacksTile;
