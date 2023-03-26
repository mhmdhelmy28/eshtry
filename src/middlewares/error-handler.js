const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
function apiErrorHandler(err, req, res, next) {
  logger.error(err.message, {
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
    stack: err.stack,
  });

  if (err instanceof ApiError) {
    return res.status(err.code).json({ message: err.message });
  }

  res.status(500).json("something went wrong");
}

module.exports = apiErrorHandler;
