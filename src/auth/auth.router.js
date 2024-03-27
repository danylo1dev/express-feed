const express = require("express");

const authController = require("./auth.controller");
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
