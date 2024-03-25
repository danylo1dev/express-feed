const path = require("path");
const io = require("./socket");
const multerConfig = require("./configs/multer.config");
const mongooseConfig = require("./configs/db.config");
const errorHandler = require("./middleware/500");
const setHeader = require("./middleware/set-headers");

const express = require("express");
const bodyParser = require("body-parser");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const { Socket } = require("socket.io");

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
