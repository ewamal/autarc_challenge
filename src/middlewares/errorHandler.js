const { ValidationError, UniqueConstraintError } = require('sequelize');

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);

  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof ValidationError || err instanceof UniqueConstraintError) {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(', ');
  }

  if (err.message === 'Customer not found') {
    statusCode = 404;
    message = err.message;
  }

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
