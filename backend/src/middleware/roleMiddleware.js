
const allowRoles = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Not authenticated. Please log in.' 
      });
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

module.exports = allowRoles;