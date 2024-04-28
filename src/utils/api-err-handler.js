class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode,
    this.message = message
    this.success = false;
  }
}

module.exports = HttpError;
