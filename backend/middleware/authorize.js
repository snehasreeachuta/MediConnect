const AppError = require('../utils/AppError');

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(`Access denied. You do not have permission to perform this action (Role: ${req.user.role}).`, 403));
    }

    next();
  };
}

module.exports = authorize;
