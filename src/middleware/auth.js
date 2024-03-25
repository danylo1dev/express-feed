const jwt = require("jsonwebtoken");
const User = require("../models/user");
const STATUS = require("../utils/UserStatus");

module.exports = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    next();
    return;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    req.isAuth = false;
    next();
    return;
  }
  if (!decodedToken) {
    req.isAuth = false;
    next();
    return;
  }
  req.userId = decodedToken.userId;
  const user = await User.findById(req.userId);
  if ([STATUS.banned, STATUS.disabled].includes(user.status)) {
    req.isAuth = false;
    next();
    return;
  }
  req.isAuth = true;
  next();
};
