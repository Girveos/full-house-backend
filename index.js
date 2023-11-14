const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require('multer');
const routes_system = require("./src/routes");
const path = require('path');
const app = express();
require("dotenv").config();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const destinationPath = path.join(__dirname, '../../Frontend/full-house-frontend/src/assets/avatar');
      cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
      cb(null,file.originalname +'.png' );
    },
  });

const upload = multer({ storage: storage });

app.use(cors());

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
app.use(upload.single('avatar'));

routes_system(app);
