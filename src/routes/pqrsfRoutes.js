const express = require("express");
const pqrsfController = require("../controllers/PQRSF");

const routes = express.Router();

routes.post("/", pqrsfController.sendPQRSF);

module.exports = routes;
