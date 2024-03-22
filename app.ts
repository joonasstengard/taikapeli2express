const express = require('express');
const app = express();
const port = 3001; 

const { getWarriors } = require('./route/getWarriors');

app.get('/', (req, res) => {
  res.send('xP');
});

app.get('/game/army/:playerId/:armyId', (req, res) => {
    const playerId = req.params.playerId;
    const armyId = req.params.armyId;
    res.json(getWarriors(playerId, armyId));
  });

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
