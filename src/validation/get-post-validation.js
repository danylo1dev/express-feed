const { body } = require("express-validator/check");

module.exports = [
  body("title").isLength({ min: 5 }),
  body("content").isLength({ min: 5 }),
];
