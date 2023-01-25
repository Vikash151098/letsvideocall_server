const winston = require("winston");

module.exports = function(err, req, res, next) {
  winston.error(err.message, err);

  // error
  // warn
  // info
  // verbose
  // debug
  // silly

  res
    .status(500)
    .send({ statusCode: 500, message: "Failure", data: "Something failed. Please try again after 5 minutes" });
};
