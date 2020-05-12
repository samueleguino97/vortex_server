const generateCrudRoutes = require("./CRUD_generator");

const router = require("express").Router();

router.use("/crud/:collection", (req, res, next) => {
  const { collection } = req.params;
  console.log(collection);
  return generateCrudRoutes(collection)(req, res, next);
});

router.get("/listCollections", async (req, res) => {
  const vortexDB = require("../../VortexDB");
  const collections = await vortexDB.list();
  const collectionsArray = await collections.toArray();
  res.send(collectionsArray);
});

router.get("/createCollection", async (req, res) => {
  const vortexDB = require("../../VortexDB");
  const { collection } = req.query;
  const result = await vortexDB.createCollection(collection);
  res.send(result);
});
router.get("/switchDb", async (req, res) => {
  const vortexDB = require("../../VortexDB");
  const { dbName } = req.query;
  const result = vortexDB.changeDb(dbName);
  res.send(result);
});

module.exports = router;
