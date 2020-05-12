let getDatabaseDocument = null;
let getDatabaseDocuments = null;
let saveDocumentTo = null;

function generateCrudRoutes(collection = "") {
  async function create(req, res) {
    const data = req.body;
    console.log(data);
    const saved = await saveDocumentTo({ collection, documentData: data });
    res.send(saved);
  }
  async function readAll(req, res) {
    const { query } = req;

    const data = await getDatabaseDocuments({
      collection,
      options: {
        query,
      },
    });
    res.send(data);
  }
  async function readOne(req, res) {
    const { id } = req.params;

    const document = await getDatabaseDocument({ collection, documentId: id });

    res.send(document);
  }
  async function updateOne(req, res) {
    const { query } = req;
    const document = await getDatabaseDocument(collection, query);

    res.send(document);
  }
  async function deleteOne(req, res) {
    const { query } = req;
    const document = await getDatabaseDocument(collection, query);
    res.send(document);
  }
  let router = require("express").Router();

  router.post("/", create);
  router.get("/", readAll);
  router.get("/:id", readOne);
  router.put("/", updateOne);
  router.delete("/", deleteOne);
  return router;
}

module.exports = generateCrudRoutes;

module.exports.configure = (functions) => {
  getDatabaseDocument = functions.getOne;
  getDatabaseDocuments = functions.get;
  saveDocumentTo = functions.create;
};
