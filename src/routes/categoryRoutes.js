const express = require("express");
const categoryController = require("../controllers/category");
const { asureAuth } = require("../middlewares/authenticated");

const routes = express.Router();

routes.post("/",asureAuth, categoryController.createCategory);
routes.get("/",asureAuth, categoryController.listCategories);
routes.get("/:categoryId",asureAuth, categoryController.listCategory);
routes.patch("/:categoryId",asureAuth, categoryController.editCategory);
routes.delete("/:categoryId",asureAuth, categoryController.deleteCategory);

module.exports = routes;
