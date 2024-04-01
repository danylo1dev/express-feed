const { validationResult } = require("express-validator/check");
const service = require("./auth.service");
const statusCode = require("../utils/statusCods");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = statusCode.unprocessableEntity;
    error.data = errors.array();
    throw error;
  }

  try {
    const result = await service.signup(req.body);
    res.status(statusCode.created).json(result);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.internallError;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await service.login(req.body);
    res.status(statusCode.ok).json(result);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.internallError;
    }
    next(err);
  }
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const result = await service.getUserStatus(req.userId);
    res.status(statusCode.ok).json(result);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.internallError;
    }
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  try {
    const result = await service.updateUserStatus({
      status: newStatus,
      userId: req.userId,
    });
    res.status(statusCode.ok).json(result);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = statusCode.internallError;
    }
    next(err);
  }
};
