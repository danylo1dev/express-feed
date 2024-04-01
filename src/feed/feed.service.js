const fs = require("fs");
const path = require("path");

const io = require("../../socket");
const Post = require("./post");
const User = require("../auth/user");
const statusCode = require("../utils/statusCods");

exports.getPosts = async ({ currentPage, perPage }) => {
  const currentPage = page || 1;
  const perPage = perPage || 2;
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
      err.statusCode = statusCode.internallError;
    }
    return err;
  }
};

exports.createPost = async ({ file, imageUrl, title, content, userId }) => {
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
    return {
      message: "Post created successfully!",
      post: post,
      creator: { _id: user._id, name: user.name },
    };
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.internallError;
    }
    return err;
  }
};

exports.getPost = async ({ postId }) => {
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
      err.statusCode = statusCode.internallError;
    }
    return err;
  }
};

exports.updatePost = async ({
  postId,
  title,
  content,
  imageUrl,
  file,
  userId,
}) => {
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
      err.statusCode = statusCode.internallError;
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
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.internallError;
    }
    next(err);
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
