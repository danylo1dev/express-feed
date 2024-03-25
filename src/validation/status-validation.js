const { body } = require("express-validator/check");

module.exports = [body("status").not().isEmpty()];
