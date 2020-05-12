const { MongoClient, ObjectId } = require("mongodb");

class MongoConnection {
  static async connectToMongo(dbName) {
    if (this.db) return this.db;

    const client = await MongoClient.connect(this.url, this.options);
    log("Connection to mongo db succesfull");
    this.client = client;
    this.db = client.db(dbName);

    return this.db;
  }

  static async changeDatabase(dbName) {
    this.db = this.client.db(dbName);
  }
}
MongoConnection.client = null;
MongoConnection.db = null;
MongoConnection.url =
  "mongodb://127.0.0.1:27015,127.0.0.1:27014/?replicaSet=rtrs";
MongoConnection.options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
MongoConnection.ObjectId = ObjectId;

module.exports = MongoConnection;
