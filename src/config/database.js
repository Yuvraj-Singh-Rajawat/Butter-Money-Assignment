import { Sequelize } from "sequelize";
import * as secret from "./secret.js";
import logger from "./logger.js";

const poolOptions = {
  max: 10,
  min: 1,
  acquire: 30000,
  idle: 10000,
};

let sequelize;

// If a full DATABASE_URL is provided (e.g. Neon), prefer that and enable SSL

if (secret.DATABASE_URL) {
  sequelize = new Sequelize(secret.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    pool: poolOptions,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        // Neon / many managed DBs use certificates not verifiable by default
        rejectUnauthorized: false,
      },
    },
  });
}

sequelize
  .authenticate()
  .then(() => {
    logger.info("Database connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

export { sequelize };
