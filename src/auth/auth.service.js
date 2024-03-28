const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./user");
const statusCode = require("../utils/statusCods");

exports.signup = async ({ email, password, name }) => {
  try {
    User.findOne({ email: value }).then((userDoc) => {
      if (userDoc) {
        return Promise.reject("E-Mail address already exists!");
      }
    });
    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({
      email: email,
      password: hashedPw,
      name: name,
    });
    const result = await user.save();
    return { message: "User created!", userId: result._id };
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.internallError;
    }
    return err;
  }
};

exports.login = async ({ email, password }) => {
  let loadedUser;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("A user with this email could not be found.");
      error.statusCode = statusCode.unauthorized;
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password!");
      error.statusCode = statusCode.unauthorized;
      throw error;
    }
    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return { token: token, userId: loadedUser._id.toString() };
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.internallError;
    }
    return err;
  }
};

exports.getUserStatus = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    return { status: user.status };
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.internallError;
    }
    return err;
  }
};

exports.updateUserStatus = async ({ status, userId }) => {
  const newStatus = status;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    user.status = newStatus;
    await user.save();
    return { message: "User updated." };
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.internallError;
    }
    return err;
  }
};
