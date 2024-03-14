const { validationResult } = require("express-validator/check");

exports.getPosts = (req, res, next) => {
  res.json({
    posts: [{ title: "test" }],
  });
};
exports.postPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const { title, content } = req.body;
  res.status(201).json({
    posts: { title, content },
  });
};
