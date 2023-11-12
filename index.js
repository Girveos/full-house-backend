const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes_system = require("./src/routes");
const app = express();
require("dotenv").config();

app.use(cors()); // Habilita CORS para todas las rutas

app.listen(process.env.PORT_PC, () =>
    console.log(`Connect in the port PC ${process.env.PORT_PC}`)
);

mongoose.set("strictQuery", false);

mongoose
    .connect(process.env.STRING_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Success connection")) 
    .catch((err) => console.error(err));

app.use(express.json());
routes_system(app);
