// 'use strict';

// const Project = require('../models/Project');
// const Allocation = require('../models/Allocation');
// const Employee = require('../models/Employee');
// const { sendProjectArchivedNotification } = require('../utils/emailService');
// const { createDeadlineNotifications } = require('./notificationController');
// const Notification = require('../models/Notification');
// const logger = require('../utils/logger');

// // ============================================
// // GET ALL PROJECTS
// // ============================================
// exports.getAllProjects = async (req, res, next) => {
//   try {
//     const projects = await Project.find({
//       status: { $ne: 'archived' }
//     })
//       .select('-__v')
//       .populate('managerId', 'name email')
//       .sort({ endDate: 1 })
//       .lean();

//     res.status(200).json(projects);
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // GET PROJECT BY ID
// // ============================================
// exports.getProjectById = async (req, res, next) => {
//   try {
//     const project = await Project.findById(req.params.id)
//       .populate('managerId', 'name email')
//       .lean();

//     if (!project) {
//       return res.status(404).json({ message: 'Project not found' });
//     }

//     res.status(200).json(project);
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // UPDATE PROJECT ALERT
// // ============================================
// const updateProjectAlert = (project) => {
//   const days = project.daysUntilDeadline;

//   if (days === null) {
//     project.deadlineAlert = false;
//     project.alertLevel = 'none';
//     return;
//   }

//   if (days < 0) {
//     project.deadlineAlert = true;
//     project.alertLevel = 'overdue';
//     return;
//   }

//   if (days <= 3) {
//     project.deadlineAlert = true;
//     project.alertLevel = 'critical';
//     return;
//   }

//   if (days <= 7) {
//     project.deadlineAlert = true;
//     project.alertLevel = 'warning';
//     return;
//   }

//   project.deadlineAlert = false;
//   project.alertLevel = 'none';
// };

// // ============================================
// // CREATE PROJECT
// // ============================================
// exports.createProject = async (req, res, next) => {
//   try {
//     const {
//       name,
//       description,
//       requiredSkills,
//       resources,
//       startDate,
//       endDate
//     } = req.body;

//     if (new Date(endDate) <= new Date(startDate)) {
//       return res.status(400).json({
//         message: 'End date must be after start date'
//       });
//     }

//     const project = await Project.create({
//       name,
//       description,
//       requiredSkills,
//       resources,
//       managerId: req.user._id,
//       startDate,
//       endDate
//     });

//     updateProjectAlert(project);
//     await project.save();

//     const notificationCount = await createDeadlineNotifications(project._id);

//     logger.info(
//       `Project created: "${project.name}" by ${req.user.name} (ID: ${project._id})`
//     );
//     logger.info(
//       `Created ${notificationCount} deadline notifications`
//     );

//     res.status(201).json(project);
//   } catch (error) {
//     logger.error(`Create project failed: ${error.message}`);
//     next(error);
//   }
// };

// // ============================================
// // UPDATE PROJECT
// // ============================================
// exports.updateProject = async (req, res, next) => {
//   try {
//     const project = await Project.findById(req.params.id);

//     if (!project) {
//       return res.status(404).json({
//         message: 'Project not found'
//       });
//     }

//     if (
//       req.user.role !== 'admin' &&
//       project.managerId.toString() !== req.user._id.toString()
//     ) {
//       return res.status(403).json({
//         message: 'Only the assigned manager or admin can update this project'
//       });
//     }

//     const {
//       name,
//       description,
//       requiredSkills,
//       resources,
//       startDate,
//       endDate,
//       status
//     } = req.body;

//     const newStartDate =
//       startDate !== undefined ? new Date(startDate) : project.startDate;

//     const newEndDate =
//       endDate !== undefined ? new Date(endDate) : project.endDate;

//     if (newEndDate <= newStartDate) {
//       return res.status(400).json({
//         message: 'End date must be after start date'
//       });
//     }

//     if (name !== undefined) {
//       project.name = name;
//     }

//     if (description !== undefined) {
//       project.description = description;
//     }

//     if (requiredSkills !== undefined) {
//       project.requiredSkills = requiredSkills;
//     }

//     if (resources !== undefined) {
//       project.resources = resources;
//     }

//     if (startDate !== undefined || endDate !== undefined) {
//       project.startDate = newStartDate;
//       project.endDate = newEndDate;

//       project.notificationSent = {
//         warningSent: false,
//         criticalSent: false,
//         overdueSent: false
//       };
//     }

//     if (status !== undefined) {
//       project.status = status;
//     }

//     updateProjectAlert(project);

//     await project.save();

//     logger.info(
//       `Project updated: "${project.name}" by ${req.user.name} (ID: ${project._id})`
//     );

//     await createDeadlineNotifications(project._id);

//     const updatedProject = await Project.findById(project._id)
//       .populate('managerId', 'name email')
//       .lean();

//     res.status(200).json(updatedProject);
//   } catch (error) {
//     logger.error(`Update project failed: ${error.message}`);
//     next(error);
//   }
// };

// // ============================================
// // SOFT DELETE (ARCHIVE)
// // ============================================
// exports.deleteProject = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { deletionReason } = req.body;

//     const project = await Project.findById(id);

//     if (!project) {
//       return res.status(404).json({
//         message: 'Project not found'
//       });
//     }

//     if (project.status === 'archived') {
//       return res.status(400).json({
//         message: 'Project is already archived'
//       });
//     }

//     if (
//       req.user.role !== 'admin' &&
//       project.managerId.toString() !== req.user._id.toString()
//     ) {
//       return res.status(403).json({
//         message: 'Not authorized to delete this project'
//       });
//     }

//     const allocations = await Allocation.find({
//       projectId: id,
//       status: 'active'
//     })
//       .select('employeeId allocatedHours')
//       .populate('employeeId', 'name email')
//       .lean();

//     const adminName = req.user.name || 'Admin';

//     const validAllocations = allocations.filter(
//       (allocation) => allocation.employeeId
//     );

//     await Promise.all(
//       validAllocations.map((allocation) =>
//         sendProjectArchivedNotification(
//           {
//             name: allocation.employeeId.name,
//             email: allocation.employeeId.email,
//             allocatedHours: allocation.allocatedHours
//           },
//           project,
//           adminName
//         )
//       )
//     );

//     await Allocation.updateMany(
//       {
//         projectId: id,
//         status: 'active'
//       },
//       {
//         status: 'completed',
//         closedReason: 'project_archived',
//         closedAt: new Date(),
//         endDate: new Date()
//       }
//     );

//     project.status = 'archived';
//     project.deletedAt = new Date();
//     project.deletedBy = req.user._id;
//     project.deletionReason =
//       deletionReason || 'Project archived by admin';

//     await project.save();

//     logger.info(
//       `Project archived: "${project.name}" by ${req.user.name} (ID: ${project._id})`
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Project archived successfully',
//       project: {
//         id: project._id,
//         name: project.name,
//         status: project.status
//       },
//       notifications: {
//         sent: validAllocations.length,
//         employees: validAllocations.map(
//           (allocation) => allocation.employeeId.name
//         )
//       },
//       allocationsClosed: allocations.length
//     });
//   } catch (error) {
//     logger.error(`Archive project failed: ${error.message}`);
//     next(error);
//   }
// };

// // ============================================
// // HARD DELETE (PERMANENT)
// // ============================================
// exports.hardDeleteProject = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { deletionReason } = req.body;

//     const project = await Project.findById(id);

//     if (!project) {
//       return res.status(404).json({
//         message: 'Project not found'
//       });
//     }

//     if (
//       req.user.role !== 'admin' &&
//       project.managerId.toString() !== req.user._id.toString()
//     ) {
//       return res.status(403).json({
//         message: 'Not authorized to delete this project'
//       });
//     }

//     const allocations = await Allocation.find({
//       projectId: id,
//       status: 'active'
//     })
//       .select('employeeId')
//       .populate('employeeId', 'name email')
//       .lean();

//     const adminName = req.user.name || 'Admin';

//     const notifications = allocations
//       .filter((allocation) => allocation.employeeId)
//       .map((allocation) => ({
//         employeeId: allocation.employeeId._id,
//         projectId: project._id,
//         projectName: project.name,
//         message: `❌ Project "${project.name}" has been permanently deleted by ${adminName}. Reason: ${deletionReason || 'Not specified'}. Your allocation has been closed.`,
//         type: 'deleted',
//         daysRemaining: 0,
//         read: false,
//         dismissed: false
//       }));

//     if (notifications.length > 0) {
//       await Notification.insertMany(notifications);
//     }

//     await Allocation.updateMany(
//       {
//         projectId: id,
//         status: 'active'
//       },
//       {
//         status: 'completed',
//         closedReason: 'project_archived',
//         closedAt: new Date(),
//         endDate: new Date()
//       }
//     );

//     await Project.findByIdAndDelete(id);

//     res.status(200).json({
//       success: true,
//       message: 'Project permanently deleted',
//       notificationsSent: notifications.length,
//       allocationsClosed: allocations.length
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // GET ARCHIVED PROJECTS
// // ============================================
// exports.getArchivedProjects = async (req, res, next) => {
//   try {
//     const projects = await Project.find({
//       status: 'archived'
//     })
//       .populate('managerId', 'name email')
//       .sort({ endDate: 1 })
//       .lean();

//     res.status(200).json(projects);
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // GET SUGGESTED EMPLOYEES
// // ============================================
// exports.getSuggestedEmployees = async (req, res, next) => {
//   try {
//     const project = await Project.findById(req.params.id)
//       .select('requiredSkills')
//       .lean();

//     if (!project) {
//       return res.status(404).json({
//         message: 'Project not found'
//       });
//     }

//     const requiredSkills = project.requiredSkills || [];

//     const employees = await Employee.find({
//       skills: { $in: requiredSkills },
//       role: { $ne: 'admin' }
//     })
//       .select('name skills capacityHours')
//       .lean();

//     if (employees.length === 0) {
//       return res.status(200).json([]);
//     }

//     const employeeIds = employees.map((employee) => employee._id);

//     const allocationTotals = await Allocation.aggregate([
//       {
//         $match: {
//           status: 'active',
//           employeeId: { $in: employeeIds }
//         }
//       },
//       {
//         $group: {
//           _id: '$employeeId',
//           totalAllocatedHours: {
//             $sum: '$allocatedHours'
//           }
//         }
//       }
//     ]);

//     const allocatedHoursMap = new Map(
//       allocationTotals.map((item) => [
//         item._id.toString(),
//         item.totalAllocatedHours
//       ])
//     );

//     const suggestions = employees.map((employee) => {
//       const allocatedHours =
//         allocatedHoursMap.get(employee._id.toString()) || 0;

//       const availableHours =
//         employee.capacityHours - allocatedHours;

//       const employeeSkills = employee.skills || [];

//       const matchedSkills = employeeSkills.filter((skill) =>
//         requiredSkills.includes(skill)
//       );

//       return {
//         employeeId: employee._id,
//         name: employee.name,
//         matchedSkills,
//         matchScore: matchedSkills.length,
//         availableHours
//       };
//     });

//     const filteredAndSorted = suggestions
//       .filter((employee) => employee.availableHours > 0)
//       .sort((a, b) => b.matchScore - a.matchScore);

//     res.status(200).json(filteredAndSorted);
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // RESTORE ARCHIVED PROJECT
// // ============================================
// exports.restoreProject = async (req, res, next) => {
//   try {
//     const project = await Project.findById(req.params.id);

//     if (!project) {
//       return res.status(404).json({
//         message: 'Project not found'
//       });
//     }

//     if (project.status !== 'archived') {
//       return res.status(400).json({
//         message: 'Project is not archived'
//       });
//     }

//     project.status = 'active';
//     project.deletedAt = null;
//     project.deletedBy = null;
//     project.deletionReason = '';

//     await project.save();

//     logger.info(
//       `Project restored: "${project.name}" by ${req.user.name} (ID: ${project._id})`
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Project restored successfully',
//       project
//     });
//   } catch (error) {
//     logger.error(`Restore project failed: ${error.message}`);
//     next(error);
//   }
// };

// // ============================================
// // GET PROJECT TEAM MEMBERS
// // ============================================
// exports.getProjectTeam = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const project = await Project.findById(id)
//       .select('name')
//       .lean();

//     if (!project) {
//       return res.status(404).json({
//         message: 'Project not found'
//       });
//     }

//     const allocations = await Allocation.find({
//       projectId: id,
//       status: 'active'
//     })
//       .select(
//         'employeeId allocatedHours startDate endDate'
//       )
//       .populate(
//         'employeeId',
//         'name email role department skills capacityHours'
//       )
//       .lean();

//     const teamMembers = allocations
//       .filter((allocation) => allocation.employeeId)
//       .map((allocation) => ({
//         employeeId: allocation.employeeId._id,
//         name: allocation.employeeId.name,
//         email: allocation.employeeId.email,
//         role: allocation.employeeId.role,
//         department:
//           allocation.employeeId.department || 'Not specified',
//         skills: allocation.employeeId.skills || [],
//         capacityHours: allocation.employeeId.capacityHours,
//         allocatedHours: allocation.allocatedHours,
//         startDate: allocation.startDate,
//         endDate: allocation.endDate,
//         allocationId: allocation._id
//       }));

//     res.status(200).json({
//       projectId: project._id,
//       projectName: project.name,
//       totalMembers: teamMembers.length,
//       teamMembers
//     });
//   } catch (error) {
//     next(error);
//   }
// };














'use strict';

const Project = require('../models/Project');
const Allocation = require('../models/Allocation');
const Employee = require('../models/Employee');
const { sendProjectArchivedNotification } = require('../utils/emailService');
const { createDeadlineNotifications } = require('./notificationController');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

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

// ============================================
// GET ALL PROJECTS
// ============================================
exports.getAllProjects = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const projects = await Project.find({
      organizationId,
      status: { $ne: 'archived' }
    })
      .select('-__v')
      .populate('managerId', 'name email')
      .sort({ endDate: 1 })
      .lean();

    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET PROJECT BY ID
// ============================================
exports.getProjectById = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const project = await Project.findOne({
      _id: req.params.id,
      organizationId
    })
      .populate('managerId', 'name email')
      .lean();

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

// ============================================
// UPDATE PROJECT ALERT
// ============================================
const updateProjectAlert = (project) => {
  const days = project.daysUntilDeadline;

  if (days === null) {
    project.deadlineAlert = false;
    project.alertLevel = 'none';
    return;
  }

  if (days < 0) {
    project.deadlineAlert = true;
    project.alertLevel = 'overdue';
    return;
  }

  if (days <= 3) {
    project.deadlineAlert = true;
    project.alertLevel = 'critical';
    return;
  }

  if (days <= 7) {
    project.deadlineAlert = true;
    project.alertLevel = 'warning';
    return;
  }

  project.deadlineAlert = false;
  project.alertLevel = 'none';
};

// ============================================
// CREATE PROJECT
// ============================================
exports.createProject = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const {
      name,
      description,
      requiredSkills,
      resources,
      startDate,
      endDate
    } = req.body;

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        message: 'End date must be after start date'
      });
    }

    const project = await Project.create({
      name,
      description,
      requiredSkills,
      resources,
      managerId: req.user._id,
      organizationId,
      startDate,
      endDate
    });

    updateProjectAlert(project);
    await project.save();

    const notificationCount =
      await createDeadlineNotifications(project._id);

    logger.info(
      `Project created: "${project.name}" by ${req.user.name} (ID: ${project._id})`
    );

    logger.info(
      `Created ${notificationCount} deadline notifications`
    );

    res.status(201).json(project);
  } catch (error) {
    logger.error(`Create project failed: ${error.message}`);
    next(error);
  }
};

// ============================================
// UPDATE PROJECT
// ============================================
exports.updateProject = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const project = await Project.findOne({
      _id: req.params.id,
      organizationId
    });

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    if (
      req.user.role !== 'admin' &&
      project.managerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: 'Only the assigned manager or admin can update this project'
      });
    }

    const {
      name,
      description,
      requiredSkills,
      resources,
      startDate,
      endDate,
      status
    } = req.body;

    const newStartDate =
      startDate !== undefined
        ? new Date(startDate)
        : project.startDate;

    const newEndDate =
      endDate !== undefined
        ? new Date(endDate)
        : project.endDate;

    if (newEndDate <= newStartDate) {
      return res.status(400).json({
        message: 'End date must be after start date'
      });
    }

    if (name !== undefined) {
      project.name = name;
    }

    if (description !== undefined) {
      project.description = description;
    }

    if (requiredSkills !== undefined) {
      project.requiredSkills = requiredSkills;
    }

    if (resources !== undefined) {
      project.resources = resources;
    }

    if (startDate !== undefined || endDate !== undefined) {
      project.startDate = newStartDate;
      project.endDate = newEndDate;

      project.notificationSent = {
        warningSent: false,
        criticalSent: false,
        overdueSent: false
      };
    }

    if (status !== undefined) {
      project.status = status;
    }

    updateProjectAlert(project);

    await project.save();

    logger.info(
      `Project updated: "${project.name}" by ${req.user.name} (ID: ${project._id})`
    );

    await createDeadlineNotifications(project._id);

    const updatedProject = await Project.findOne({
      _id: project._id,
      organizationId
    })
      .populate('managerId', 'name email')
      .lean();

    res.status(200).json(updatedProject);
  } catch (error) {
    logger.error(`Update project failed: ${error.message}`);
    next(error);
  }
};

// ============================================
// SOFT DELETE (ARCHIVE)
// ============================================
exports.deleteProject = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const { id } = req.params;
    const { deletionReason } = req.body;

    const project = await Project.findOne({
      _id: id,
      organizationId
    });

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    if (project.status === 'archived') {
      return res.status(400).json({
        message: 'Project is already archived'
      });
    }

    if (
      req.user.role !== 'admin' &&
      project.managerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: 'Not authorized to delete this project'
      });
    }

    const allocations = await Allocation.find({
      projectId: id,
      organizationId,
      status: 'active'
    })
      .select('employeeId allocatedHours')
      .populate('employeeId', 'name email')
      .lean();

    const adminName = req.user.name || 'Admin';

    const validAllocations = allocations.filter(
      (allocation) => allocation.employeeId
    );

    await Promise.all(
      validAllocations.map((allocation) =>
        sendProjectArchivedNotification(
          {
            name: allocation.employeeId.name,
            email: allocation.employeeId.email,
            allocatedHours: allocation.allocatedHours
          },
          project,
          adminName
        )
      )
    );

    await Allocation.updateMany(
      {
        projectId: id,
        organizationId,
        status: 'active'
      },
      {
        status: 'completed',
        closedReason: 'project_archived',
        closedAt: new Date(),
        endDate: new Date()
      }
    );

    project.status = 'archived';
    project.deletedAt = new Date();
    project.deletedBy = req.user._id;
    project.deletionReason =
      deletionReason || 'Project archived by admin';

    await project.save();

    logger.info(
      `Project archived: "${project.name}" by ${req.user.name} (ID: ${project._id})`
    );

    res.status(200).json({
      success: true,
      message: 'Project archived successfully',
      project: {
        id: project._id,
        name: project.name,
        status: project.status
      },
      notifications: {
        sent: validAllocations.length,
        employees: validAllocations.map(
          (allocation) => allocation.employeeId.name
        )
      },
      allocationsClosed: allocations.length
    });
  } catch (error) {
    logger.error(`Archive project failed: ${error.message}`);
    next(error);
  }
};

// ============================================
// HARD DELETE (PERMANENT)
// ============================================
exports.hardDeleteProject = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const { id } = req.params;
    const { deletionReason } = req.body;

    const project = await Project.findOne({
      _id: id,
      organizationId
    });

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    if (
      req.user.role !== 'admin' &&
      project.managerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: 'Not authorized to delete this project'
      });
    }

    const allocations = await Allocation.find({
      projectId: id,
      organizationId,
      status: 'active'
    })
      .select('employeeId')
      .populate('employeeId', 'name email')
      .lean();

    const adminName = req.user.name || 'Admin';

    const notifications = allocations
  .filter((allocation) => allocation.employeeId)
  .map((allocation) => ({
    employeeId: allocation.employeeId._id,
    projectId: project._id,
    organizationId,
    projectName: project.name,
    message: `❌ Project "${project.name}" has been permanently deleted by ${adminName}. Reason: ${deletionReason || 'Not specified'}. Your allocation has been closed.`,
    type: 'deleted',
    daysRemaining: 0,
    read: false,
    dismissed: false,
    chatMessageId: null
  }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    await Allocation.updateMany(
      {
        projectId: id,
        organizationId,
        status: 'active'
      },
      {
        status: 'completed',
        closedReason: 'project_archived',
        closedAt: new Date(),
        endDate: new Date()
      }
    );

    await Project.findOneAndDelete({
      _id: id,
      organizationId
    });

    res.status(200).json({
      success: true,
      message: 'Project permanently deleted',
      notificationsSent: notifications.length,
      allocationsClosed: allocations.length
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET ARCHIVED PROJECTS
// ============================================
exports.getArchivedProjects = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const projects = await Project.find({
      organizationId,
      status: 'archived'
    })
      .populate('managerId', 'name email')
      .sort({ endDate: 1 })
      .lean();

    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET SUGGESTED EMPLOYEES
// ============================================
exports.getSuggestedEmployees = async (req, res, next) => {
  try {
    // Only admin and manager can access suggestions
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        message:
          'Only admins and managers can view suggested employees'
      });
    }

    const organizationId = getOrganizationId(req, res);

    if (!organizationId) return;

    const project = await Project.findOne({
      _id: req.params.id,
      organizationId
    })
      .select('requiredSkills')
      .lean();

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    /*
     * Support:
     * 1. ["React", "Node.js", "MongoDB"]
     * 2. ["React, Node.js, MongoDB"]
     * 3. ["React Node.js MongoDB"]
     */
    const requiredSkills = (project.requiredSkills || [])
      .flatMap((skill) =>
        String(skill).split(/[,;\n]/)
      )
      .map((skill) => skill.trim().toLowerCase())
      .filter(Boolean);

    if (requiredSkills.length === 0) {
      return res.status(200).json([]);
    }

    const employees = await Employee.find({
      organizationId,
      role: { $ne: 'admin' }
    })
      .select('name skills capacityHours')
      .lean();

    if (employees.length === 0) {
      return res.status(200).json([]);
    }

    /*
     * Build a normalized required-skills string as well.
     * This handles the case where a user entered:
     *
     * "React Node.js Socket.io MongoDB Javascript"
     *
     * as one project skill value.
     */
    const requiredSkillsText =
      requiredSkills.join(' ').toLowerCase();

    const employeeIds = employees.map(
      (employee) => employee._id
    );

    const allocationTotals = await Allocation.aggregate([
      {
        $match: {
          organizationId,
          status: 'active',
          employeeId: {
            $in: employeeIds
          }
        }
      },
      {
        $group: {
          _id: '$employeeId',
          totalAllocatedHours: {
            $sum: '$allocatedHours'
          }
        }
      }
    ]);

    const allocatedHoursMap = new Map(
      allocationTotals.map((item) => [
        item._id.toString(),
        item.totalAllocatedHours
      ])
    );

    const suggestions = employees.map((employee) => {
      const allocatedHours =
        allocatedHoursMap.get(
          employee._id.toString()
        ) || 0;

      const capacityHours =
        employee.capacityHours || 0;

      const availableHours =
        capacityHours - allocatedHours;

      const employeeSkills = (
        employee.skills || []
      )
        .map((skill) => skill.trim())
        .filter(Boolean);

      const matchedSkills =
        employeeSkills.filter((skill) => {
          const normalizedSkill =
            skill.toLowerCase();

          // Exact skill match
          if (
            requiredSkills.includes(
              normalizedSkill
            )
          ) {
            return true;
          }

          // Handles a single required-skills string
          // such as "react node.js socket.io mongodb javascript"
          return requiredSkillsText.includes(
            normalizedSkill
          );
        });

      return {
        employeeId: employee._id,
        name: employee.name,
        matchedSkills,
        matchScore: matchedSkills.length,
        availableHours
      };
    });

    const filteredAndSorted =
      suggestions
        .filter(
          (employee) =>
            employee.availableHours > 0 &&
            employee.matchScore > 0
        )
        .sort(
          (a, b) =>
            b.matchScore - a.matchScore
        );

    res.status(200).json(
      filteredAndSorted
    );
  } catch (error) {
    console.error(
      'Get suggested employees failed:',
      error.message
    );

    next(error);
  }
};




// ============================================
// RESTORE ARCHIVED PROJECT
// ============================================
exports.restoreProject = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const project = await Project.findOne({
      _id: req.params.id,
      organizationId
    });

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    if (project.status !== 'archived') {
      return res.status(400).json({
        message: 'Project is not archived'
      });
    }

    project.status = 'active';
    project.deletedAt = null;
    project.deletedBy = null;
    project.deletionReason = '';

    await project.save();

    logger.info(
      `Project restored: "${project.name}" by ${req.user.name} (ID: ${project._id})`
    );

    res.status(200).json({
      success: true,
      message: 'Project restored successfully',
      project
    });
  } catch (error) {
    logger.error(`Restore project failed: ${error.message}`);
    next(error);
  }
};

// ============================================
// GET PROJECT TEAM MEMBERS
// ============================================
exports.getProjectTeam = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);
    if (!organizationId) return;

    const { id } = req.params;

    const project = await Project.findOne({
      _id: id,
      organizationId
    })
      .select('name')
      .lean();

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    const allocations = await Allocation.find({
      projectId: id,
      organizationId,
      status: 'active'
    })
      .select(
        'employeeId allocatedHours startDate endDate'
      )
      .populate(
        'employeeId',
        'name email role department skills capacityHours'
      )
      .lean();

    const teamMembers = allocations
      .filter(
        (allocation) => allocation.employeeId
      )
      .map((allocation) => ({
        employeeId: allocation.employeeId._id,
        name: allocation.employeeId.name,
        email: allocation.employeeId.email,
        role: allocation.employeeId.role,
        department:
          allocation.employeeId.department ||
          'Not specified',
        skills: allocation.employeeId.skills || [],
        capacityHours:
          allocation.employeeId.capacityHours,
        allocatedHours:
          allocation.allocatedHours,
        startDate: allocation.startDate,
        endDate: allocation.endDate,
        allocationId: allocation._id
      }));

    res.status(200).json({
      projectId: project._id,
      projectName: project.name,
      totalMembers: teamMembers.length,
      teamMembers
    });
  } catch (error) {
    next(error);
  }
};

