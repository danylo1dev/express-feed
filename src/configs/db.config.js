const mongoose = require("mongoose");

module.exports = (cb) => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then((result) => {
      cb();
    })
    .catch((err) => console.log(err));
};
