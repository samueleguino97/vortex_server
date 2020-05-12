const enviroment_variables = require("./server_config/bootstrap");

const { startServer } = require("./server_config/server");

const MongoConnection = require("./server_config/db");
MongoConnection.connectToMongo("auth").then(() => {
  const { configure } = require("./routes/crud/CRUD_generator");

  startServer(enviroment_variables.PORT);

  const vortexDB = require("./VortexDB");
  configure({
    getOne: vortexDB.get,
    get: vortexDB.get,
    create: vortexDB.create,
  });
});
