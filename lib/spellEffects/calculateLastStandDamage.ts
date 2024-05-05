// deals more damage the less health attacker has, up to 2x
// can be used with spells, attacks, skills etc by anyone

function calculateLastStandDamage(attackingWarrior, baseDamageTarget) {
  const maxHealth = attackingWarrior.health;
  const currentHealth = attackingWarrior.currentHealth;

  // Calculate the fraction of health missing
  const healthMissingFraction = (maxHealth - currentHealth) / maxHealth;

  // Damage scales linearly from baseDamageTarget to 2 * baseDamageTarget
  const damage = baseDamageTarget + baseDamageTarget * healthMissingFraction;

  // Ensure the damage does not exceed 2 times the base damage
  const finalDamage = Math.min(damage, 2 * baseDamageTarget);

  return Math.round(finalDamage); // Round to the nearest whole number for clean damage values
}

export default calculateLastStandDamage;
