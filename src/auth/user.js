const mongoose = require("mongoose");
const STATUS = require("../utils/UserStatus");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: STATUS.new,
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});
userSchema.index({ name: 1, email: 1 });

module.exports = mongoose.model("User", userSchema);
