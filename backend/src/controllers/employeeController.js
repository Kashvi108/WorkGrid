// 'use strict';

// const Employee = require('../models/Employee');

// exports.getAllEmployees = async (req, res, next) => {
//   try {
//     const employees = await Employee.find()
//       .select('-password')
//       .lean();

//     res.status(200).json(employees);
//   } catch (error) {
//     next(error);
//   }
// };

// exports.getEmployeeById = async (req, res, next) => {
//   try {
//     const employee = await Employee.findById(req.params.id)
//       .select('-password')
//       .lean();

//     if (!employee) {
//       return res.status(404).json({ message: 'Employee not found' });
//     }

//     res.status(200).json(employee);
//   } catch (error) {
//     next(error);
//   }
// };

// exports.createEmployee = async (req, res, next) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       role,
//       skills,
//       department,
//       capacityHours
//     } = req.body;

//     const existingEmployee = await Employee.findOne({ email })
//       .select('_id')
//       .lean();

//     if (existingEmployee) {
//       return res.status(409).json({ message: 'Email already exists' });
//     }

//     const employee = await Employee.create({
//       name,
//       email,
//       password,
//       role,
//       skills,
//       department,
//       capacityHours
//     });

//     const employeeResponse = employee.toObject();
//     delete employeeResponse.password;

//     res.status(201).json(employeeResponse);
//   } catch (error) {
//     next(error);
//   }
// };

// exports.updateEmployee = async (req, res, next) => {
//   try {
//     const {
//       name,
//       skills,
//       department,
//       capacityHours
//     } = req.body;

//     const employee = await Employee.findById(req.params.id);

//     if (!employee) {
//       return res.status(404).json({ message: 'Employee not found' });
//     }

//     if (
//       req.user.role !== 'admin' &&
//       req.user._id.toString() !== req.params.id
//     ) {
//       return res.status(403).json({
//         message: 'You can only update your own profile'
//       });
//     }

//     if (name !== undefined) {
//       employee.name = name;
//     }

//     if (skills !== undefined) {
//       employee.skills = skills;
//     }

//     if (department !== undefined) {
//       employee.department = department;
//     }

//     if (capacityHours !== undefined) {
//       employee.capacityHours = capacityHours;
//     }

//     await employee.save();

//     const employeeResponse = employee.toObject();
//     delete employeeResponse.password;

//     res.status(200).json(employeeResponse);
//   } catch (error) {
//     next(error);
//   }
// };

// exports.deleteEmployee = async (req, res, next) => {
//   try {
//     const employee = await Employee.findByIdAndDelete(req.params.id);

//     if (!employee) {
//       return res.status(404).json({ message: 'Employee not found' });
//     }

//     res.status(200).json({
//       message: 'Employee deleted successfully'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.updateEmployeeRole = async (req, res, next) => {
//   try {
//     const { role } = req.body;

//     if (!['admin', 'manager', 'employee'].includes(role)) {
//       return res.status(400).json({
//         message: 'Invalid role specified'
//       });
//     }

//     const employee = await Employee.findById(req.params.id);

//     if (!employee) {
//       return res.status(404).json({
//         message: 'Employee not found'
//       });
//     }

//     employee.role = role;
//     await employee.save();

//     res.status(200).json({
//       message: `${employee.name} is now a ${role}`,
//       employee: {
//         id: employee._id,
//         name: employee.name,
//         role: employee.role
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };










'use strict';

const Employee = require('../models/Employee');

const getOrganizationId = (req, res) => {
  const organizationId =
    req.organizationId || req.user?.organizationId;

  if (!organizationId) {
    res.status(403).json({
      message: 'No organization assigned to this account.'
    });

    return null;
  }

  return organizationId;
};

exports.getAllEmployees = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const employees = await Employee.find({
      organizationId,
      role: { $ne: 'admin' }
    })
      .select('-password')
      .lean();

    res.status(200).json(employees);
  } catch (error) {
    next(error);
  }
};

exports.getEmployeeById = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const employee = await Employee.findOne({
      _id: req.params.id,
      organizationId,
      role: { $ne: 'admin' }
    })
      .select('-password')
      .lean();

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    res.status(200).json(employee);
  } catch (error) {
    next(error);
  }
};

exports.createEmployee = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const {
      name,
      email,
      password,
      role,
      skills,
      department,
      capacityHours
    } = req.body;

    const existingEmployee = await Employee.findOne({
      email,
      organizationId
    })
      .select('_id')
      .lean();

    if (existingEmployee) {
      return res.status(409).json({
        message: 'Email already exists'
      });
    }

    const employee = await Employee.create({
      name,
      email,
      password,
      role,
      organizationId,
      skills,
      department,
      capacityHours
    });

    const employeeResponse = employee.toObject();
    delete employeeResponse.password;

    res.status(201).json(employeeResponse);
  } catch (error) {
    next(error);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const {
      name,
      skills,
      department,
      capacityHours
    } = req.body;

    const employee = await Employee.findOne({
      _id: req.params.id,
      organizationId,
      role: { $ne: 'admin' }
    });

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    if (
      req.user.role !== 'admin' &&
      req.user._id.toString() !== req.params.id
    ) {
      return res.status(403).json({
        message: 'You can only update your own profile'
      });
    }

    if (name !== undefined) {
      employee.name = name;
    }

    if (skills !== undefined) {
      employee.skills = skills;
    }

    if (department !== undefined) {
      employee.department = department;
    }

    if (capacityHours !== undefined) {
      employee.capacityHours = capacityHours;
    }

    await employee.save();

    const employeeResponse = employee.toObject();
    delete employeeResponse.password;

    res.status(200).json(employeeResponse);
  } catch (error) {
    next(error);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const employee = await Employee.findOneAndDelete({
      _id: req.params.id,
      organizationId,
      role: { $ne: 'admin' }
    });

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.updateEmployeeRole = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const { role } = req.body;

    if (!['admin', 'manager', 'employee'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role specified'
      });
    }

    const employee = await Employee.findOne({
      _id: req.params.id,
      organizationId,
      role: { $ne: 'admin' }
    });

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    employee.role = role;
    await employee.save();

    res.status(200).json({
      message: `${employee.name} is now a ${role}`,
      employee: {
        id: employee._id,
        name: employee.name,
        role: employee.role
      }
    });
  } catch (error) {
    next(error);
  }
};