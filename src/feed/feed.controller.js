const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator/check");

const io = require("../../socket");
const Post = require("./post");
const User = require("../auth/user");
const statusCode = require("../utils/statusCods");
const service = require("./feed.service");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const result = await service.getPosts({ currentPage, perPage });

    res.status(statusCode.ok).json(result);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.internallError;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = statusCode.unprocessableEntity;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = statusCode.unprocessableEntity;
    throw error;
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;

  try {
    const result = await service.createPost({
      file,
      imageUrl,
      title,
      content,
      userId,
    });
    io.getIO().emit("posts", {
      action: "create",
      ...result,
    });
    res.status(statusCode.created).json({
      message: "Post created successfully!",
      ...result,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.internallError;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const result = await service.getPost({ postId });
    res.status(statusCode.ok).json({ message: "Post fetched.", post: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.notFound;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = statusCode.unprocessableEntity;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  try {
    const post = await service.updatePost({
      postId,
      title,
      content,
      imageUrl,
      file,
      userId,
    });
    io.getIO().emit("posts", { action: "update", post });
    res.status(statusCode.ok).json({ message: "Post updated!", post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.internallError;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    await service.deletePost(postId);
    io.getIO().emit("posts", { action: "delete", post: postId });
    res.status(statusCode.ok).json({ message: "Deleted post." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.internallError;
    }
    next(err);
  }
};
