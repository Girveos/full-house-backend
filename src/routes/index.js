const express = require("express");
const user_routes_access = require("./userRoutes"); 
const auth_routes_access = require("./authRoutes");
const product_routes_access = require("./productRoutes");
const category_routes_access = require("./categoryRoutes");
const routes = express. Router();
const routes_system = (app) => {
    app.use("/api/v1", routes);
    routes.use("/user", user_routes_access);
    routes.use("/", auth_routes_access);
    routes.use("/product", product_routes_access);
    routes.use("/category", category_routes_access);
};

module.exports = routes_system;
