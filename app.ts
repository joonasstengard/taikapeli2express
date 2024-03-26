const express = require("express");
const cors = require('cors');

import getArmy from "./route/getArmy";
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

//army
app.get("/game/army/:userId/:armyId", async (req, res) => {
  res.send(await getArmy(req, res))
});

// user
app.get("/game/user/:userId", async (req, res) => {
  res.send(await getUser(req, res))
});

// warriors
app.get("/game/army/:userId/:armyId", async (req, res) => {
  res.send(await getWarriors(req, res))
});

//start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
