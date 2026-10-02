// const jwt = require('jsonwebtoken');
// const Employee = require('../models/Employee');

// const protect = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ message: 'No token provided, access denied' });
//     }

//     const token = authHeader.split(' ')[1];

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const employee = await Employee.findById(decoded.id).select('-password');
//     if (!employee) {
//       return res.status(401).json({ message: 'User no longer exists' });
//     }

//     req.user = employee;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: 'Invalid or expired token' });
//   }
// };

// module.exports = protect;








const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'No token provided, access denied'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const employee = await Employee.findById(decoded.id).select('-password');

    if (!employee) {
      return res.status(401).json({
        message: 'User no longer exists'
      });
    }

    req.user = employee;

    // Organization context comes from the database.
    if (employee.organizationId) {
      req.organizationId = employee.organizationId;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
};

module.exports = protect;

