import db from "../db";
import calculateLastStandDamage from "./spellEffects/calculateLastStandDamage";

async function warriorCastsSpellToTile(
  tileId: string,
  spellId: number,
  attackingWarriorId: number,
  playersArmyId: number,
  computersArmyId: number
) {
  try {
    // Query to find defenders on the specified tile from either the player's or computer's army
    const queryDefender = `
        SELECT id, currentHealth, health, name, magicResistance
        FROM warriors
        WHERE battleTileCurrent = ?
          AND (armyId = ? OR armyId = ?)`;
    const [defenders] = await db
      .promise()
      .query<any[]>(queryDefender, [tileId, playersArmyId, computersArmyId]);

    // Check if defenders exist
    if (defenders.length === 0) {
      throw new Error(
        "No defending warrior found as spell target on the specified tile with the given army IDs."
      );
    }
    const defender = defenders[0];

    // Query to find the spell
    const querySpell = `
        SELECT baseDamageTarget, baseHealTarget, name, manaCost
        FROM spells
        WHERE id = ?`;
    const [spells] = await db.promise().query<any[]>(querySpell, [spellId]);

    // Check if spell exists
    if (spells.length === 0) {
      throw new Error("Spell not found.");
    }
    const spell = spells[0];

    // Query to find the attacking warrior's current mana
    const queryAttackingWarrior = `
        SELECT currentMana, name
        FROM warriors
        WHERE id = ?`;
    const [attackingWarriorResult] = await db
      .promise()
      .query<any[]>(queryAttackingWarrior, [attackingWarriorId]);

    if (attackingWarriorResult.length === 0) {
      throw new Error("Attacking warrior not found.");
    }
    const attackingWarrior = attackingWarriorResult[0];
    // Failsafe check to see if the warrior has enough mana to cast the spell
    if (attackingWarrior.currentMana < spell.manaCost) {
      throw new Error("Insufficient mana to cast the spell.");
    }
    // Calculate new mana for the attacking warrior after spell cast
    let newMana = Math.max(attackingWarrior.currentMana - spell.manaCost, 0);
    // Update attacking warrior's mana in the database
    const updateManaQuery = `
        UPDATE warriors
        SET currentMana = ?
        WHERE id = ?`;
    await db.promise().query(updateManaQuery, [newMana, attackingWarriorId]);

    // initializing value that will be the defending warriors new health
    let newHealth;
    if (spell.baseDamageTarget > 0) {
      // initializing damage of spell as baseDamageTarget, can be overridden by effects
      let spellsDamage = spell.baseDamageTarget;
      // checking for spell effects ===
      if (spell.effect === "lastStand") {
        // Calculate damage based on the attacking warrior's missing health
        spellsDamage = calculateLastStandDamage(
          attackingWarrior,
          spell.baseDamageTarget
        );
      }
      // Calculate new health for the defender considering magic resistance
      const damageReduction = (defender.magicResistance / 100) * spellsDamage;
      const adjustedDamage = Math.round(spellsDamage - damageReduction);
      newHealth = Math.max(defender.currentHealth - adjustedDamage, 0); // Ensure health does not go below zero
    }
    if (spell.baseHealTarget > 0) {
      // healing spell
      const potentialNewHealth = defender.currentHealth + spell.baseHealTarget;
      newHealth = Math.min(potentialNewHealth, defender.health); // Ensure health does not exceed maxHealth
    }
    // Update defender's health in the database
    const updateQuery = `
        UPDATE warriors
        SET currentHealth = ?
        WHERE id = ?`;
    await db.promise().query(updateQuery, [newHealth, defender.id]);

    console.log(
      "Spell " +
        spell.name +
        " was cast by warrior with id:" +
        attackingWarriorId +
        " to " +
        defender.name +
        " successfully, new health: " +
        newHealth
    );
    // return commentary line
    return (
      attackingWarrior.name +
      " cast " +
      spell.name +
      " to " +
      defender.name +
      ", new health: " +
      newHealth +
      "."
    );
  } catch (error) {
    console.error("Error during casting spell:", error.message);
  }
}

export default warriorCastsSpellToTile;
