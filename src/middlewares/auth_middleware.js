/* eslint-env node */
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const logger = require("../utils/logger");
const isAuthenticated = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).send({ message: "user not authorized" });
  }

  const token = authorization.split(" ")[1];
  try {
    const { userId } = jwt.verify(token, process.env.JWT_ACCESS);
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(401, "user not authorized");
    }
    res.locals.userId = userId;
    next();
  } catch (error) {
    logger.error(error.message);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401, "access token expires");
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401, "user not authorized");
    } else {
      res.status(500);
    }
  }
};

module.exports = isAuthenticated;
