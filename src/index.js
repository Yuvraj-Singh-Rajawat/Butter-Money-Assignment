import app from "./app.js";
import { sequelize } from "./config/database.js";
import logger from "./config/logger.js";
import * as secret from "./config/secret.js";

let server;

sequelize
  .sync()
  .then(() => {
    logger.info("Connected to Postgres database");
    const port = Number(secret.PORT) || 3000;
    server = app.listen(port, () => {
      logger.info(`App listening on port ${port}!`);
    });
  })
  .catch((err) => {
    logger.error("Unable to connect to the database:", err);
  });

// ------------- Don't Modify  -------------
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
