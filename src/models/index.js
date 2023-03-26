const fs = require("fs").promises;
const config = require("../config/config");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(config[process.env.NODE_ENV || "development"]);

const initDatabase = async () => {
  const modelsDir = await fs.readdir("./src/models/");

  modelsDir
    .filter((file) => file !== "index.js")
    .map((file) => {
      const model = require(`./${file}`);
      model.init(sequelize);
      return model;
    })
    .forEach((model) => {
      model.setAssociations();
    });

  await sequelize.sync();
};
module.exports = { initDatabase, sequelize };
