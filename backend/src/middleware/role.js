const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access forbidden: This action is restricted to [${roles.join(', ')}] users only.`
      });
    }
    next();
  };
};

module.exports = { authorize };
