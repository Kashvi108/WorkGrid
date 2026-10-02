// const Allocation = require('../models/Allocation');
// const Employee = require('../models/Employee');
// const Project = require('../models/Project');
// const { createDeadlineNotifications } = require('./notificationController');


// exports.checkEmployeeAvailability = async (req, res, next) => {
//   try {
//     const { employeeId, startDate, endDate, excludeAllocationId } = req.query;

//     if (!employeeId || !startDate || !endDate) {
//       return res.status(400).json({
//         message: 'employeeId, startDate, and endDate are required'
//       });
//     }

//     const newStart = new Date(startDate);
//     const newEnd = new Date(endDate);

//     // ✅ Simplified inclusive overlap check:
//     //    existing.startDate <= newEnd AND existing.endDate >= newStart
//     const query = {
//       employeeId,
//       status: 'active',
//       startDate: { $lte: newEnd },
//       endDate: { $gte: newStart }
//     };

//     // If updating an existing allocation, exclude it from conflict check
//     if (excludeAllocationId) {
//       query._id = { $ne: excludeAllocationId };
//     }

//    const [conflictingAllocations, employee] = await Promise.all([ Allocation.find(query) .select('projectId startDate endDate allocatedHours') .populate('projectId', 'name status') .lean(), Employee.findById(employeeId).select('name') ]);


//     res.status(200).json({
//       available: conflictingAllocations.length === 0,
//       conflicts: conflictingAllocations.map(a => ({
//         allocationId: a._id,
//         projectName: a.projectId?.name || 'Unknown Project',
//         startDate: a.startDate,
//         endDate: a.endDate,
//         allocatedHours: a.allocatedHours
//       })),
//       employeeName: employee?.name || 'Employee'
//     });

//   } catch (error) {
//     next(error);
//   }
// };




// exports.createAllocation = async (req, res, next) => {
//   try {
//     const { employeeId, projectId, allocatedHours, startDate, endDate } = req.body;

//     // Validate employee exists
//     const [employee, project] = await Promise.all([ Employee.findById(employeeId), Project.findById(projectId) ]); if (!employee) { return res.status(404).json({ message: 'Employee not found' }); } if (!project) { return res.status(404).json({ message: 'Project not found' }); }

//     // ============================================
//     // NEW: DATE CONFLICT DETECTION
//     // ============================================
//     const newStart = new Date(startDate);
//     const newEnd = new Date(endDate);

//     const conflictingAllocations = await Allocation.find({
//   employeeId,
//   status: 'active',
//   startDate: { $lte: newEnd },
//   endDate: { $gte: newStart }
// })
//   .select('projectId startDate endDate allocatedHours')
//   .populate('projectId', 'name')
//   .lean();

//     if (conflictingAllocations.length > 0) {
//       const conflictDetails = conflictingAllocations.map(a => 
//         `${a.projectId?.name || 'Unknown'} (${new Date(a.startDate).toLocaleDateString()} - ${new Date(a.endDate).toLocaleDateString()})`
//       ).join(', ');

//       return res.status(409).json({
//         message: `❌ ${employee.name} is already allocated during this period!`,
//         conflicts: conflictingAllocations.map(a => ({
//           projectName: a.projectId?.name || 'Unknown',
//           startDate: a.startDate,
//           endDate: a.endDate,
//           allocatedHours: a.allocatedHours
//         })),
//         conflictDetails
//       });
//     }

//     // ============================================
//     // EXISTING: Hour capacity validation
//     // ============================================
//     const existingAllocations = await Allocation.find({
//   employeeId,
//   status: 'active'
// }).select('allocatedHours');

// const currentAllocatedHours = existingAllocations.reduce(
//   (sum, allocation) => sum + allocation.allocatedHours,
//   0
// );

//     const totalAfterNewAllocation = currentAllocatedHours + allocatedHours;

//     if (totalAfterNewAllocation > employee.capacityHours) {
//       return res.status(409).json({
//         message: `⚠️ Capacity exceeded: ${employee.name} has ${currentAllocatedHours}h already allocated out of ${employee.capacityHours}h capacity. Cannot add ${allocatedHours}h more.`
//       });
//     }

//     // Create allocation
//     const allocation = await Allocation.create({
//       employeeId,
//       projectId,
//       allocatedHours,
//       startDate,
//       endDate
//     });
//     await createDeadlineNotifications(projectId);

//     res.status(201).json(allocation);
//   } catch (error) {
//     next(error);
//   }
// };



// exports.getAllAllocations = async (req, res, next) => {
//   try {
//     const { employeeId, projectId, page = 1, limit = 20 } = req.query;

//     // ✅ Safe pagination (matches chatController.js convention)
//     const MAX_LIMIT = 100;
//     const DEFAULT_LIMIT = 20;

//     let parsedPage = Number.parseInt(page, 10);
//     if (!Number.isInteger(parsedPage) || parsedPage < 1) {
//       parsedPage = 1;
//     }

//     let parsedLimit = Number.parseInt(limit, 10);
//     if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
//       parsedLimit = DEFAULT_LIMIT;
//     }
//     parsedLimit = Math.min(parsedLimit, MAX_LIMIT);

//     const skip = (parsedPage - 1) * parsedLimit;

//     // ✅ Preserve existing filters exactly
//     const filter = {};
//     if (employeeId) filter.employeeId = employeeId;
//     if (projectId) filter.projectId = projectId;

//     // ✅ Run find + count in parallel
//     const [allocations, total] = await Promise.all([
//       Allocation.find(filter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(parsedLimit)
//         .populate('employeeId', 'name email skills')
//         .populate('projectId', 'name status')
//         .lean(),
//       Allocation.countDocuments(filter)
//     ]);

//     res.status(200).json({
//       allocations,
//       total,
//       page: parsedPage,
//       totalPages: Math.ceil(total / parsedLimit)
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.getAllocationsByEmployee = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 20 } = req.query;

//     // ✅ Safe, bounded pagination (same inline pattern as getAllAllocations & chatController)
//     const MAX_LIMIT = 100;
//     const DEFAULT_LIMIT = 20;

//     let parsedPage = Number.parseInt(page, 10);
//     if (!Number.isInteger(parsedPage) || parsedPage < 1) {
//       parsedPage = 1;
//     }

//     let parsedLimit = Number.parseInt(limit, 10);
//     if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
//       parsedLimit = DEFAULT_LIMIT;
//     }
//     parsedLimit = Math.min(parsedLimit, MAX_LIMIT);

//     const skip = (parsedPage - 1) * parsedLimit;

//     // ✅ Preserve existing employee filter exactly
//     const filter = { employeeId: req.params.employeeId };

//     // ✅ Run find + count in parallel
//     const [allocations, total] = await Promise.all([
//       Allocation.find(filter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(parsedLimit)
//         .populate('projectId', 'name status')
//         .lean(),
//       Allocation.countDocuments(filter)
//     ]);

//     res.status(200).json({
//       allocations,
//       total,
//       page: parsedPage,
//       totalPages: Math.ceil(total / parsedLimit)
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.updateAllocation = async (req, res, next) => {
//   try {
//     const allocation = await Allocation.findById(req.params.id);
//     if (!allocation) {
//       return res.status(404).json({ message: 'Allocation not found' });
//     }

//     const { allocatedHours, status, startDate, endDate } = req.body;

//     // ============================================
//     // NEW: Check date conflict on update
//     // ============================================
//     if (startDate || endDate) {
//       const newStart = startDate ? new Date(startDate) : allocation.startDate;
//       const newEnd = endDate ? new Date(endDate) : allocation.endDate;

//       const conflictingAllocations = await Allocation.find({
//   employeeId: allocation.employeeId,
//   status: 'active',
//   _id: { $ne: allocation._id },
//   startDate: { $lte: newEnd },
//   endDate: { $gte: newStart }
// })
//   .select('projectId startDate endDate allocatedHours')
//   .populate('projectId', 'name')
//   .lean();

//       if (conflictingAllocations.length > 0) {
//         const conflictDetails = conflictingAllocations.map(a => 
//           `${a.projectId?.name || 'Unknown'} (${new Date(a.startDate).toLocaleDateString()} - ${new Date(a.endDate).toLocaleDateString()})`
//         ).join(', ');

//         return res.status(409).json({
//           message: `❌ This employee is already allocated during this period! Conflicts with: ${conflictDetails}`,
//           conflicts: conflictingAllocations
//         });
//       }

//       if (startDate) allocation.startDate = startDate;
//       if (endDate) allocation.endDate = endDate;
//     }

//     // ============================================
//     // EXISTING: Hour capacity validation on update
//     // ============================================
//     if (allocatedHours && allocatedHours !== allocation.allocatedHours) {
//       const employee = await Employee.findById(allocation.employeeId);

//       const otherAllocations = await Allocation.find({
//   employeeId: allocation.employeeId,
//   status: 'active',
//   _id: { $ne: allocation._id }
// }).select('allocatedHours');

// const otherHours = otherAllocations.reduce(
//   (sum, a) => sum + a.allocatedHours,
//   0
// );

//       if (otherHours + allocatedHours > employee.capacityHours) {
//         return res.status(409).json({
//           message: `⚠️ Over-allocation: cannot update to ${allocatedHours}h. ${employee.name} already has ${otherHours}h from other allocations, capacity is ${employee.capacityHours}h.`
//         });
//       }

//       allocation.allocatedHours = allocatedHours;
//     }

//     if (status) allocation.status = status;

//     await allocation.save();

//     const updatedAllocation = await Allocation.findById(allocation._id)
//       .populate('employeeId', 'name email')
//       .populate('projectId', 'name status')
//       .lean();

//     res.status(200).json(updatedAllocation);
//   } catch (error) {
//     next(error);
//   }
// };

// exports.deleteAllocation = async (req, res, next) => {
//   try {
//     const allocation = await Allocation.findByIdAndDelete(req.params.id);
//     if (!allocation) {
//       return res.status(404).json({ message: 'Allocation not found' });
//     }
//     res.status(200).json({ message: 'Allocation deleted successfully' });
//   } catch (error) {
//     next(error);
//   }
// };











'use strict';

const Allocation = require('../models/Allocation');
const Employee = require('../models/Employee');
const Project = require('../models/Project');
const {
  createDeadlineNotifications
} = require('./notificationController');

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

exports.checkEmployeeAvailability = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const {
      employeeId,
      startDate,
      endDate,
      excludeAllocationId
    } = req.query;

    if (!employeeId || !startDate || !endDate) {
      return res.status(400).json({
        message: 'employeeId, startDate, and endDate are required'
      });
    }

    const employee = await Employee.findOne({
      _id: employeeId,
      organizationId
    }).select('name');

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    const query = {
      organizationId,
      employeeId,
      status: 'active',
      startDate: { $lte: newEnd },
      endDate: { $gte: newStart }
    };

    if (excludeAllocationId) {
      query._id = { $ne: excludeAllocationId };
    }

    const conflictingAllocations = await Allocation.find(query)
      .select(
        'projectId startDate endDate allocatedHours'
      )
      .populate('projectId', 'name status')
      .lean();

    res.status(200).json({
      available: conflictingAllocations.length === 0,
      conflicts: conflictingAllocations.map((a) => ({
        allocationId: a._id,
        projectName: a.projectId?.name || 'Unknown Project',
        startDate: a.startDate,
        endDate: a.endDate,
        allocatedHours: a.allocatedHours
      })),
      employeeName: employee.name || 'Employee'
    });
  } catch (error) {
    next(error);
  }
};

exports.createAllocation = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const {
      employeeId,
      projectId,
      allocatedHours,
      startDate,
      endDate
    } = req.body;

    const [employee, project] = await Promise.all([
      Employee.findOne({
        _id: employeeId,
        organizationId
      }),
      Project.findOne({
        _id: projectId,
        organizationId
      })
    ]);

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    const conflictingAllocations = await Allocation.find({
      organizationId,
      employeeId,
      status: 'active',
      startDate: { $lte: newEnd },
      endDate: { $gte: newStart }
    })
      .select(
        'projectId startDate endDate allocatedHours'
      )
      .populate('projectId', 'name')
      .lean();

    if (conflictingAllocations.length > 0) {
      const conflictDetails = conflictingAllocations
        .map(
          (a) =>
            `${a.projectId?.name || 'Unknown'} (${new Date(
              a.startDate
            ).toLocaleDateString()} - ${new Date(
              a.endDate
            ).toLocaleDateString()})`
        )
        .join(', ');

      return res.status(409).json({
        message: `❌ ${employee.name} is already allocated during this period!`,
        conflicts: conflictingAllocations.map((a) => ({
          projectName: a.projectId?.name || 'Unknown',
          startDate: a.startDate,
          endDate: a.endDate,
          allocatedHours: a.allocatedHours
        })),
        conflictDetails
      });
    }

    const existingAllocations = await Allocation.find({
      organizationId,
      employeeId,
      status: 'active'
    }).select('allocatedHours');

    const currentAllocatedHours =
      existingAllocations.reduce(
        (sum, allocation) =>
          sum + allocation.allocatedHours,
        0
      );

    const totalAfterNewAllocation =
      currentAllocatedHours + allocatedHours;

    if (
      totalAfterNewAllocation >
      employee.capacityHours
    ) {
      return res.status(409).json({
        message: `⚠️ Capacity exceeded: ${employee.name} has ${currentAllocatedHours}h already allocated out of ${employee.capacityHours}h capacity. Cannot add ${allocatedHours}h more.`
      });
    }

    const allocation = await Allocation.create({
      employeeId,
      projectId,
      organizationId,
      allocatedHours,
      startDate,
      endDate
    });

    await createDeadlineNotifications(projectId);

    res.status(201).json(allocation);
  } catch (error) {
    next(error);
  }
};

exports.getAllAllocations = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const {
      employeeId,
      projectId,
      page = 1,
      limit = 20
    } = req.query;

    const MAX_LIMIT = 100;
    const DEFAULT_LIMIT = 20;

    let parsedPage = Number.parseInt(page, 10);

    if (
      !Number.isInteger(parsedPage) ||
      parsedPage < 1
    ) {
      parsedPage = 1;
    }

    let parsedLimit = Number.parseInt(limit, 10);

    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1
    ) {
      parsedLimit = DEFAULT_LIMIT;
    }

    parsedLimit = Math.min(
      parsedLimit,
      MAX_LIMIT
    );

    const skip =
      (parsedPage - 1) * parsedLimit;

    const filter = {
      organizationId
    };

    if (employeeId) {
      filter.employeeId = employeeId;
    }

    if (projectId) {
      filter.projectId = projectId;
    }

    const [allocations, total] =
      await Promise.all([
        Allocation.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parsedLimit)
          .populate(
            'employeeId',
            'name email skills'
          )
          .populate(
            'projectId',
            'name status'
          )
          .lean(),

        Allocation.countDocuments(filter)
      ]);

    res.status(200).json({
      allocations,
      total,
      page: parsedPage,
      totalPages: Math.ceil(
        total / parsedLimit
      )
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllocationsByEmployee = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const requestedEmployeeId = req.params.employeeId;
    const currentUserId = req.user._id.toString();

    // Employees can only view their own allocations.
    // Admins and managers can view allocations for employees
    // within their organization.
    if (
      req.user.role === 'employee' &&
      requestedEmployeeId !== currentUserId
    ) {
      return res.status(403).json({
        message: 'You can only view your own allocations'
      });
    }

    const employee = await Employee.findOne({
      _id: requestedEmployeeId,
      organizationId
    }).select('_id');

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    const {
      page = 1,
      limit = 20
    } = req.query;

    const MAX_LIMIT = 100;
    const DEFAULT_LIMIT = 20;

    let parsedPage = Number.parseInt(page, 10);

    if (
      !Number.isInteger(parsedPage) ||
      parsedPage < 1
    ) {
      parsedPage = 1;
    }

    let parsedLimit = Number.parseInt(limit, 10);

    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1
    ) {
      parsedLimit = DEFAULT_LIMIT;
    }

    parsedLimit = Math.min(
      parsedLimit,
      MAX_LIMIT
    );

    const skip =
      (parsedPage - 1) * parsedLimit;

    const filter = {
      organizationId,
      employeeId: requestedEmployeeId
    };

    const [allocations, total] =
      await Promise.all([
        Allocation.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parsedLimit)
          .populate(
            'projectId',
            'name status'
          )
          .lean(),

        Allocation.countDocuments(filter)
      ]);

    res.status(200).json({
      allocations,
      total,
      page: parsedPage,
      totalPages: Math.ceil(
        total / parsedLimit
      )
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAllocation = async (
  req,
  res,
  next
) => {
  try {
    const organizationId =
      getOrganizationId(req, res);

    if (!organizationId) return;

    const allocation =
      await Allocation.findOne({
        _id: req.params.id,
        organizationId
      });

    if (!allocation) {
      return res.status(404).json({
        message: 'Allocation not found'
      });
    }

    const {
      allocatedHours,
      status,
      startDate,
      endDate
    } = req.body;

    if (startDate || endDate) {
      const newStart = startDate
        ? new Date(startDate)
        : allocation.startDate;

      const newEnd = endDate
        ? new Date(endDate)
        : allocation.endDate;

      const conflictingAllocations =
        await Allocation.find({
          organizationId,
          employeeId:
            allocation.employeeId,
          status: 'active',
          _id: {
            $ne: allocation._id
          },
          startDate: {
            $lte: newEnd
          },
          endDate: {
            $gte: newStart
          }
        })
          .select(
            'projectId startDate endDate allocatedHours'
          )
          .populate(
            'projectId',
            'name'
          )
          .lean();

      if (
        conflictingAllocations.length > 0
      ) {
        const conflictDetails =
          conflictingAllocations
            .map(
              (a) =>
                `${a.projectId?.name || 'Unknown'} (${new Date(
                  a.startDate
                ).toLocaleDateString()} - ${new Date(
                  a.endDate
                ).toLocaleDateString()})`
            )
            .join(', ');

        return res.status(409).json({
          message: `❌ This employee is already allocated during this period! Conflicts with: ${conflictDetails}`,
          conflicts:
            conflictingAllocations
        });
      }

      if (startDate) {
        allocation.startDate =
          startDate;
      }

      if (endDate) {
        allocation.endDate =
          endDate;
      }
    }

    if (
      allocatedHours &&
      allocatedHours !==
        allocation.allocatedHours
    ) {
      const employee =
        await Employee.findOne({
          _id: allocation.employeeId,
          organizationId
        });

      if (!employee) {
        return res.status(404).json({
          message: 'Employee not found'
        });
      }

      const otherAllocations =
        await Allocation.find({
          organizationId,
          employeeId:
            allocation.employeeId,
          status: 'active',
          _id: {
            $ne: allocation._id
          }
        }).select('allocatedHours');

      const otherHours =
        otherAllocations.reduce(
          (sum, a) =>
            sum + a.allocatedHours,
          0
        );

      if (
        otherHours + allocatedHours >
        employee.capacityHours
      ) {
        return res.status(409).json({
          message: `⚠️ Over-allocation: cannot update to ${allocatedHours}h. ${employee.name} already has ${otherHours}h from other allocations, capacity is ${employee.capacityHours}h.`
        });
      }

      allocation.allocatedHours =
        allocatedHours;
    }

    if (status) {
      allocation.status = status;
    }

    await allocation.save();

    const updatedAllocation =
      await Allocation.findOne({
        _id: allocation._id,
        organizationId
      })
        .populate(
          'employeeId',
          'name email'
        )
        .populate(
          'projectId',
          'name status'
        )
        .lean();

    res.status(200).json(
      updatedAllocation
    );
  } catch (error) {
    next(error);
  }
};

exports.deleteAllocation = async (
  req,
  res,
  next
) => {
  try {
    const organizationId =
      getOrganizationId(req, res);

    if (!organizationId) return;

    const allocation =
      await Allocation.findOneAndDelete({
        _id: req.params.id,
        organizationId
      });

    if (!allocation) {
      return res.status(404).json({
        message: 'Allocation not found'
      });
    }

    res.status(200).json({
      message: 'Allocation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

