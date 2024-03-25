const express = require("express");
const cors = require('cors');
import db from './db';

import getUser from "./route/getUser";
import getWarriors from "./route/getWarriors";

const app = express();
const port = 3001;

app.use(cors({
  origin: '*'
}));

app.get("/", (req, res) => {
  res.send("xP");
});

app.get('/dbtest', (req, res) => {
  db.query('SELECT * FROM users', (error, results, fields) => {
    if (error) throw error;
    res.send(results);
  });
});

// user
app.get("/game/user/:userId", async (req, res) => {
  res.send(await getUser(req, res))
});

// army
app.get("/game/army/:userId/:armyId", async (req, res) => {
  res.send(await getWarriors(req, res))
});

//start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
