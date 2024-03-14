const express = require("express");
const { body } = require("express-validator/check");
const feedController = require("../controllers/feed");

const router = express.Router();

router.get("/posts", feedController.getPosts);
router.post(
  "/post",
  [
    body("title").trim().isLenght({ min: 5 }),
    body("content").trim().isLenght({ min: 5 }),
  ],
  feedController.postPost
);

module.exports = router;
