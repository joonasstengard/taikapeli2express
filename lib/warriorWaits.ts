import db from "../db";

// warrior waits, restores some stats, can be used by anyone
async function warriorWaits(warriorId) {
  try {
    const queryResult: any = await new Promise((resolve, reject) => {
      db.query(
        "SELECT health, mana, stamina, currentHealth, currentMana, currentStamina FROM warriors WHERE id = ?",
        [warriorId],
        (error, results: any) => {
          if (error) {
            reject(error);
          } else if (results.length > 0) {
            resolve(results[0]);
          } else {
            reject(new Error("Warrior not found"));
          }
        }
      );
    });

    const {
      health,
      mana,
      stamina,
      currentHealth,
      currentMana,
      currentStamina,
    } = queryResult;

    // restore 20% of currentHealth / currentMana / currentStamina, rounded to whole number, not exceeding max
    const newCurrentHealth = Math.min(
      health,
      Math.round(currentHealth + 0.2 * health)
    );
    const newCurrentMana = Math.min(mana, Math.round(currentMana + 0.2 * mana));
    const newCurrentStamina = Math.min(
      stamina,
      Math.round(currentStamina + 0.2 * stamina)
    );

    // Update the database with the new values
    await new Promise((resolve, reject) => {
      db.query(
        "UPDATE warriors SET currentHealth = ?, currentMana = ?, currentStamina = ? WHERE id = ?",
        [newCurrentHealth, newCurrentMana, newCurrentStamina, warriorId],
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
    console.error("Error in warriorWaits function:", error);
    throw error;
  }
}

export default warriorWaits;
