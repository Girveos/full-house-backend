const express = require("express");
const productController = require("../controllers/product");
const { asureAuth } = require("../middlewares/authenticated");

const routes = express.Router();

routes.post("/",asureAuth, productController.createProduct);
routes.get("/",asureAuth, productController.listProducts);
routes.get("/:productId",asureAuth, productController.listProduct);
routes.patch("/:productId",asureAuth, productController.editProduct);
routes.delete("/:productId",asureAuth, productController.deleteProduct);

module.exports = routes;
