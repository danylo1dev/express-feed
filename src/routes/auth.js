const express = require("express");

const User = require("../models/user");
const authController = require("../controllers/auth");
const isAuth = require("../middleware/auth");
const signupValidation = require("../validation/signup-validation");
const statusValidation = require("../validation/status-validation");

const router = express.Router();

router.put("/signup", signupValidation, authController.signup);

router.post("/login", authController.login);

router.get("/status", isAuth, authController.getUserStatus);

router.patch(
  "/status",
  isAuth,
  statusValidation,
  authController.updateUserStatus
);

module.exports = router;
