const express = require("express");
const cors = require("cors");

import computersWarriorsTurn from "./route/computersWarriorsTurn";
import getArmy from "./route/getArmy";
import getUser from "./route/getUser";
import getUsersCurrentBattle from "./route/getUsersCurrentBattle";
import getWarriors from "./route/getWarriors";
import attackWithPlayersWarriorToTile from "./route/attackWithPlayersWarriorToTile";
import movePlayersWarriorToTile from "./route/movePlayersWarriorToTile";
import playersWarriorWaits from "./route/playersWarriorWaits";

const app = express();
const port = 3001;

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.send("xP");
});

// army
app.get("/game/army/:userId/:armyId", async (req, res) => {
  res.send(await getArmy(req, res));
});

// ====================================================================
// battle
// get users current battle
app.get("/game/battle/getuserscurrentbattle/:userId", async (req, res) => {
  res.send(await getUsersCurrentBattle(req, res));
});
// PLAYERS actions in battle ------------------------
app.get(
  "/game/battle/warriors/attackwithplayerswarriortotile/:warriorId/:tileId/:playersArmyId/:computersArmyId",
  async (req, res) => {
    try {
      const result = await attackWithPlayersWarriorToTile(req);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error with players warrior attacking");
    }
  }
);

// move PLAYERS warrior to tile, return all warriors
app.get(
  "/game/battle/warriors/moveplayerswarriortotile/:warriorId/:tileId/:playersArmyId/:computersArmyId",
  async (req, res) => {
    try {
      const result = await movePlayersWarriorToTile(req);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error moving players warrior to tile");
    }
  }
);
// players warrior waits, return all warriors
app.get(
  "/game/battle/warriors/playerswarriorwait/:warriorId/:playersArmyId/:computersArmyId",
  async (req, res) => {
    try {
      const result = await playersWarriorWaits(req);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error with players warrior waiting");
    }
  }
);

// ----------------------------------------------------
// computers (opponent) warriors turn, return all warriors from the battle
app.get(
  "/game/battle/computerswarriorsturn/:playersArmyId/:computersArmyId",
  async (req, res) => {
    try {
      res.send(await computersWarriorsTurn(req));
    } catch (error) {
      console.error(error);
      res.status(500).send("Error with computers warriors turn");
    }
  }
);
// ====================================================================

// user
app.get("/game/user/:userId", async (req, res) => {
  res.send(await getUser(req, res));
});

// ====================================================================
// warriors
app.get("/game/warriors/:userId/:armyId", async (req, res) => {
  res.send(await getWarriors(req, res));
});

// ====================================================================

//start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
