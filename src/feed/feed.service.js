const fs = require("fs");
const path = require("path");

const io = require("../../socket");
const Post = require("./post");
const User = require("../auth/user");

exports.getPosts = async ({ page }, res, next) => {
  const currentPage = page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    return {
      message: "Fetched posts successfully.",
      posts: posts,
      totalItems: totalItems,
    };
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    return err;
  }
};

exports.createPost = async (
  { file, imageUrl, title, content, userId },
  res,
  next
) => {
  if (!file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: userId,
  });
  try {
    await post.save();
    const user = await User.findById(userId);
    user.posts.push(post);
    await user.save();
    io.getIO().emit("posts", {
      action: "create",
      post: { ...post._doc, creator: { _id: userId, name: user.name } },
    });
    return {
      message: "Post created successfully!",
      post: post,
      creator: { _id: user._id, name: user.name },
    };
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    return err;
  }
};

exports.getPost = async ({ postId }, res, next) => {
  const post = await Post.findById(postId);
  try {
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    return { message: "Post fetched.", post: post };
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    return err;
  }
};

exports.updatePost = async (
  { postId, title, content, imageUrl, file, userId },
  res,
  next
) => {
  if (file) {
    imageUrl = file.path;
  }
  if (!imageUrl) {
    const error = new Error("No file picked.");
    error.statusCode = 422;
    throw error;
  }
  try {
    const post = await Post.findById(postId).populate("creator");
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator._id.toString() !== userId) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    const result = await post.save();
    return result;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    return err;
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }

    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(postId);

    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    io.getIO().emit("posts", { action: "delete", post: postId });
    res.status(200).json({ message: "Deleted post." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
