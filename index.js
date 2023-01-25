const winston = require("winston");
const express = require("express");
const config = require("config");

const SocketManager = require("./Libs/SocketManager");

const app = express();
const sockServer = require("http").createServer(app);

require("./startup/logging")();
require("./startup/logger");
require("./startup/cors")(app);
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();
require("./startup/prod")(app);



const port = process.env.PORT || config.get("port");

SocketManager.connectSocket(sockServer);
const server = sockServer.listen(port, () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports = server;
