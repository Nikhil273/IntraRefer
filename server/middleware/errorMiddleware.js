// server/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
  // Determine the status code. If res.statusCode was set by a controller (e.g., res.status(400)), use that.
  // Otherwise, default to 500 for internal server errors.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode);

  // Send a JSON response for all errors
  res.json({
    message: err.message, // The general error message (e.g., "Validation failed" or "Invalid credentials")
    // Include specific validation errors if they exist (from express-validator or custom errors)
    errors: err.errors || null, // This property will hold the errors.array() if attached
    // Only send stack trace in development for debugging
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = {
  errorHandler,
};
