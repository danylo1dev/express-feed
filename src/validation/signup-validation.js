const { body } = require("express-validator/check");

module.exports = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .normalizeEmail(),
  body("password").isLength({ min: 5 }),
  body("name").not().isEmpty(),
];
