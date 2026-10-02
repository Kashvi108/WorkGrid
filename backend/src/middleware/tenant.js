'use strict';

const requireTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Not authenticated. Please log in.'
    });
  }

  if (!req.user.organizationId) {
    return res.status(403).json({
      message: 'No organization assigned to this account.'
    });
  }

  req.organizationId = req.user.organizationId;

  next();
};

module.exports = requireTenant;

