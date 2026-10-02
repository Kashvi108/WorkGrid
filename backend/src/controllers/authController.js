// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const Employee = require('../models/Employee');

// const generateToken = (employeeId, role) => {
//   return jwt.sign(
//     { id: employeeId, role },
//     process.env.JWT_SECRET,
//     { expiresIn: '7d' }
//   );
// };

// exports.register = async (req, res, next) => {
//   try {
//     const { name, email, password, skills, department, capacityHours } = req.body;

//     const existingEmployee = await Employee.findOne({ email });
//     if (existingEmployee) {
//       return res.status(409).json({ message: 'Email already registered' });
//     }

//     const userCount = await Employee.countDocuments();
//     const assignedRole = userCount === 0 ? 'admin' : 'employee';  

//     const employee = await Employee.create({
//       name,
//       email,
//       password,
//       role: assignedRole,
//       skills,
//       department,
//       capacityHours
//     });

//     const token = generateToken(employee._id, employee.role);

//     res.status(201).json({
//       token,
//       employee: {
//         id: employee._id,
//         name: employee.name,
//         email: employee.email,
//         role: employee.role
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     const employee = await Employee.findOne({ email });
//     if (!employee) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const isMatch = await bcrypt.compare(password, employee.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const token = generateToken(employee._id, employee.role);

//     res.status(200).json({
//       token,
//       employee: {
//         id: employee._id,
//         name: employee.name,
//         email: employee.email,
//         role: employee.role
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };











const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const Employee = require('../models/Employee');
const Organization = require('../models/Organization');

const generateOrganizationCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

const generateToken = (employeeId, role, organizationId) => {
  return jwt.sign(
    {
      id: employeeId,
      role,
      organizationId
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};


exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      skills,
      department,
      capacityHours,
      organizationName,
      organizationCode
    } = req.body;

    const existingEmployee = await Employee.findOne({
      email
    });

    if (existingEmployee) {
      return res.status(409).json({
        message: 'Email already registered'
      });
    }

    let organization;
    let assignedRole;

    // ============================================
    // CREATE NEW ORGANIZATION
    // ============================================
    if (!organizationCode) {
      if (!organizationName) {
        return res.status(400).json({
          message:
            'Organization name is required when creating an organization'
        });
      }

      let code = generateOrganizationCode();

      while (await Organization.exists({ code })) {
        code = generateOrganizationCode();
      }

      organization = await Organization.create({
        name: organizationName,
        code
      });

      assignedRole = 'admin';
    }

    // ============================================
    // JOIN EXISTING ORGANIZATION
    // ============================================
    else {
      organization = await Organization.findOne({
        code: organizationCode
          .toUpperCase()
          .trim()
      });

      if (!organization) {
        return res.status(404).json({
          message: 'Invalid organization code'
        });
      }

      assignedRole = 'employee';
    }

    // ============================================
    // CREATE EMPLOYEE
    // ============================================
    const employee = await Employee.create({
      name,
      email,
      password,
      role: assignedRole,
      organizationId: organization._id,
      skills,
      department,
      capacityHours
    });

    const token = generateToken(
      employee._id,
      employee.role,
      organization._id
    );

    res.status(201).json({
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        organizationId: organization._id,

        organization: {
          id: organization._id,
          name: organization.name,

          ...(assignedRole === 'admin' && {
            code: organization.code
          })
        }
      }
    });
  } catch (error) {
    next(error);
  }
};



exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email });

    if (!employee) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      employee.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(
      employee._id,
      employee.role,
      employee.organizationId
    );

    const organization = employee.organizationId
      ? await Organization.findById(
          employee.organizationId
        )
          .select('name code')
          .lean()
      : null;

    res.status(200).json({
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        organizationId: employee.organizationId,
        organization: organization
          ? {
              id: organization._id,
              name: organization.name,
              ...(employee.role === 'admin' && {
                code: organization.code
              })
            }
          : null
      }
    });
  } catch (error) {
    next(error);
  }
};

