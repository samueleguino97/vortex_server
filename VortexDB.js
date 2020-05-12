const { db, ObjectId, changeDatabase } = require("./server_config/db");

const WebSocket = require("ws");

const wss = require("./server_config/server").wss;

const subscriptions = {};

const watcher = db.watch();
watcher.on("change", (change) => {
  const collection = change.ns.coll;
  const type = change.operationType;

  if (subscriptions[collection]) {
    subscriptions[collection].forEach((connection) => {
      if (type === "insert") {
        connection.send(
          JSON.stringify({
            type: "ADD",
            data: { ...change.fullDocument },
          })
        );
      }
    });
  }
});

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);

wss.on("close", () => {
  clearInterval(interval);
});

wss.on("connection", (connection) => {
  connection.isAlive = true;
  connection.on("pong", heartbeat);

  connection.on("close", () => {
    log("closing");
    const collections = Object.keys(subscriptions);
    collections.forEach((collection) => {
      const index = subscriptions[collection].findIndex(
        (item) => item === connection
      );
      subscriptions[collection].splice(index, 1);
    });
  });
  console.log("a client has connected");
  connection.on("message", async (message) => {
    const dbPathToSubscribeTo = JSON.parse(message).collection;
    if (dbPathToSubscribeTo) {
      if (Array.isArray(subscriptions[dbPathToSubscribeTo])) {
        subscriptions[dbPathToSubscribeTo] = [
          ...subscriptions[dbPathToSubscribeTo],
          connection,
        ];

        connection.send(
          JSON.stringify({
            type: "ALL",
            data: await getCollectionFromDb(dbPathToSubscribeTo),
          })
        );
      } else {
        subscriptions[dbPathToSubscribeTo] = [connection];
        connection.send(
          JSON.stringify({
            type: "ALL",
            data: await getCollectionFromDb(dbPathToSubscribeTo),
          })
        );
      }
    }
  });
});

async function getCollectionFromDb(collection = "", options = {}) {
  const dbCollection = db.collection(collection);
  const dbQuery = options.query || {};

  const foundData = await dbCollection.find(dbQuery);
  return foundData.toArray();
}
async function getDocumentFromDb(collection = "", docId = "") {
  const dbCollection = db.collection(collection);

  const _id = ObjectId.isValid(docId) ? ObjectId(docId) : docId;

  const dbDoc = await dbCollection.findOne({ _id });

  return dbDoc;
}
async function insertDocument(collection = "", docData = {}) {
  const dbCollection = db.collection(collection);

  if (docData._id) {
    const _id = ObjectId.isValid(docData._id)
      ? ObjectId(docData._id)
      : docData._id;
    docData._id = _id;
  }

  const insertedDocument = await dbCollection.insertOne(docData);
  return insertedDocument;
}
async function updateDocument(collection = "", docId, docData = {}) {
  const dbCollection = db.collection(collection);

  const _id = ObjectId.isValid(docId) ? ObjectId(docId) : docId;

  const updatedDocument = await dbCollection.updateOne(
    { _id },
    { $set: docData }
  );
  return updatedDocument;
}
async function deleteDocument(collection = "", docId) {
  const dbCollection = db.collection(collection);

  const _id = ObjectId.isValid(docId) ? ObjectId(docId) : docId;

  const deletedDocument = await dbCollection.deleteOne({
    _id,
  });
  return deletedDocument;
}
async function listCollections() {
  console.log("listing");
  const collections = await db.listCollections();
  return collections;
}

class VortexDB {
  async get({ collection = "", documentId = "", options = {} }) {
    if (collection && !documentId) {
      const collectionData = await getCollectionFromDb(collection, options);

      return collectionData;
    }
    if (collection && documentId) {
      const documentData = await getDocumentFromDb(collection, documentId);
      return documentData;
    }
  }

  async create({ collection = "", documentData = {} }) {
    if (collection && documentData) {
      const createdDocument = await insertDocument(collection, documentData);

      return createdDocument;
    }
  }

  async update({ collection = "", documentId = "", documentData = {} }) {
    if (collection && documentData) {
      const updatedDocument = await updateDocument(
        collection,
        documentId,
        documentData
      );
      if (subscriptions[collection]) {
        subscriptions[collection].forEach((connection) => {
          connection.send(
            JSON.stringify({
              type: "UPDATE",
              data: { ...documentData, _id: documentId },
            })
          );
        });
      }
      return updatedDocument;
    }
  }

  async delete({ collection = "", documentId = "" }) {
    if (collection && documentData) {
      const deletedDocument = await deleteDocument(collection, documentId);
      return deletedDocument;
    }
    if (subscriptions[collection]) {
      subscriptions[collection].forEach((connection) => {
        connection.send(
          JSON.stringify({
            type: "DELETE",
            data: { _id: documentId },
          })
        );
      });
    }
  }

  async list() {
    return await listCollections();
  }

  async createCollection(collectionName) {
    return await db.createCollection(collectionName);
  }

  async changeDb(dbName) {
    return changeDatabase(dbName);
  }
}

const vortex = new VortexDB();

module.exports = vortex;
