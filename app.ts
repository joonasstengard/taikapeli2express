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

app.get("/game/army/:userId/:armyId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const armyId = parseInt(req.params.armyId);

  try {
    const warriors = await getWarriors(userId, armyId);
    res.send(warriors);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching warriors');
  }
});

//start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
