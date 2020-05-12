const dotenv = require("dotenv");

(function configureServer() {
  //Load env
  dotenv.config();

  global.log = (logMessage) => console.log(logMessage);
})();

const envVariables = process.env;

module.exports = envVariables;
