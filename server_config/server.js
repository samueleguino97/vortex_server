const app = require("express")();
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const { json, urlencoded } = require("express");

const SERVER_RUNNING_MESSAGE = (port) =>
  `Server is now up and running on port ${port}`;

function startServer(port) {
  app.use(cors({ origin: "*" }));
  app.use(json());
  app.use(urlencoded({ extended: true }));

  app.use("/html", (req, res) => {
    res.sendFile("public/test.html", { root: "./" });
  });

  app.use("/", require("../routes/crud"));

  server.listen(port, () => {
    log(SERVER_RUNNING_MESSAGE(port));
  });
}

module.exports = {
  startServer,
  wss,
};
