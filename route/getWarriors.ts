function getWarriors(playerId: number, armyId: number) {

  
  // fetching warriors
  const warriors = [
    {
      nimi: "Sir aaa",
      class: "ritari",
      ika: 35,
      hp: 30,
      mana: 10,
      miekkaVoima: 15,
      kestavyys: 20,
      nopeus: 12,
      hurskaus: 10,
      magicResist: 0,
      kuva: "ritari",
      armeijaId: 0,
      taisteluLaatta: "a6",
      taisteluOnLiikkunutVuorolla: false,
    },
    {
      nimi: "Gandalf",
      class: "taikuri",
      ika: 78,
      hp: 8,
      mana: 30,
      miekkaVoima: 14,
      kestavyys: 10,
      nopeus: 60,
      hurskaus: 5,
      magicResist: 30,
      kuva: "taikuri",
      armeijaId: 0,
      taisteluLaatta: "b6",
      taisteluOnLiikkunutVuorolla: false,
    },
    {
      nimi: "Munkkimies",
      class: "munkki",
      ika: 52,
      hp: 12,
      mana: 22,
      miekkaVoima: 1,
      kestavyys: 5,
      nopeus: 5,
      hurskaus: 40,
      magicResist: 0,
      kuva: "munkki",
      armeijaId: 0,
      taisteluLaatta: "c6",
      taisteluOnLiikkunutVuorolla: false,
    },
    {
      nimi: "Örkkiukko",
      class: "orkki",
      ika: 32,
      hp: 35,
      mana: 5,
      miekkaVoima: 30,
      kestavyys: 15,
      nopeus: 14,
      hurskaus: 3,
      magicResist: 0,
      kuva: "orkki",
      armeijaId: 0,
      taisteluLaatta: "d6",
      taisteluOnLiikkunutVuorolla: false,
    },
  ];
  return warriors;
}

export default getWarriors;