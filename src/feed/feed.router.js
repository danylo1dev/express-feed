const express = require("express");

const feedController = require("./feed.controller");
const isAuth = require("../middleware/auth");
const getPostValidation = require("../validation/get-post-validation");

const router = express.Router();

router.get("/posts", isAuth, feedController.getPosts);

router.post("/post", isAuth, getPostValidation, feedController.createPost);

router.get("/post/:postId", isAuth, feedController.getPost);

router.put(
  "/post/:postId",
  isAuth,
  getPostValidation,
  feedController.updatePost
);

router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
