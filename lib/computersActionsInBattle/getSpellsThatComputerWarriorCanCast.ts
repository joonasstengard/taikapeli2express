function getSpellsThatComputerWarriorCanCast(warrior) {
  // wip: for now, this returns only dmg spells
  // Filter spells based on warrior having enough mana to cast them and baseDamageTarget value of higher than 0
  const eligibleSpells = warrior.spells.filter(
    (spell) =>
      spell.manaCost <= warrior.currentMana && spell.baseDamageTarget > 0
  );

  // Check if there are any eligible spells
  if (eligibleSpells.length === 0) {
    return null;
  }

  // returns an array of the spells that the warrior can cast
  return eligibleSpells;
}

export default getSpellsThatComputerWarriorCanCast;
