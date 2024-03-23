const express = require("express");
import sequelize from "./sequelize";
import User from "./models/user"; 

const app = express();
const port = 3001;
import getWarriors from "./route/getWarriors";

app.get("/", (req, res) => {
  res.send("xP");
});

app.get("/game/army/:playerId/:armyId", (req, res) => {
  const playerId = req.params.playerId;
  const armyId = req.params.armyId;
  res.json(getWarriors(playerId, armyId));
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

sequelize.sync({ force: true }).then(() => {
  console.log("Database & tables created!");
});

//start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
