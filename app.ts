const express = require("express");
import db from './db';

const app = express();
const port = 3001;
import getWarriors from "./route/getWarriors";

app.get("/", (req, res) => {
  res.send("xP");
});

app.get('/dbtest', (req, res) => {
  db.query('SELECT * FROM users', (error, results, fields) => {
    if (error) throw error;
    res.send(results);
  });
});

app.get("/game/army/:playerId/:armyId", (req, res) => {
  const playerId = req.params.playerId;
  const armyId = req.params.armyId;
  res.json(getWarriors(playerId, armyId));
});

//start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
