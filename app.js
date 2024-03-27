const path = require("path");
const io = require("./socket");
const multerConfig = require("./src/configs/multer.config");
const mongooseConfig = require("./src/configs/db.config");
const errorHandler = require("./src/middleware/500");
const setHeader = require("./src/middleware/set-headers");
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");

const feedRoutes = require("./src/feed/feed.router");
const authRoutes = require("./src/auth/auth.router");

const app = express();

app.use(bodyParser.json());
app.use(multerConfig);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(setHeader);

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use(errorHandler);

mongooseConfig(() => {
  const server = app.listen(3000);
  io.init(server);
});
