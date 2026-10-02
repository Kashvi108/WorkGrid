// 'use strict';

// const Notification = require('../models/Notification');
// const Project = require('../models/Project');
// const Allocation = require('../models/Allocation');

// // ============================================
// // 1. CREATE NOTIFICATIONS FOR A PROJECT
// // ============================================
// exports.createDeadlineNotifications = async (projectId) => {
//   try {
//     const project = await Project.findById(projectId);

//     if (!project) {
//       return 0;
//     }

//     // Only send notifications for active projects
//     if (project.status !== 'active') {
//       return 0;
//     }

//     const days = project.daysUntilDeadline;

//     if (days === null || days > 7) {
//       return 0;
//     }

//     // Get only the employee IDs we need
//     const allocations = await Allocation.find({
//       projectId,
//       status: 'active'
//     })
//       .select('employeeId')
//       .lean();

//     if (allocations.length === 0) {
//       return 0;
//     }

//     let notificationType = '';
//     let message = '';

//     if (days < 0) {
//       if (project.notificationSent?.overdueSent) {
//         return 0;
//       }

//       notificationType = 'overdue';
//       message = `⚠️ Project "${project.name}" is OVERDUE by ${Math.abs(days)} days!`;
//     } else if (days <= 3) {
//       if (project.notificationSent?.criticalSent) {
//         return 0;
//       }

//       notificationType = 'critical';
//       message = `🔴 Project "${project.name}" is due in ${days} days! Immediate attention required.`;
//     } else if (days <= 7) {
//       if (project.notificationSent?.warningSent) {
//         return 0;
//       }

//       notificationType = 'warning';
//       message = `🟡 Project "${project.name}" is approaching deadline in ${days} days.`;
//     } else {
//       return 0;
//     }

//     const notifications = allocations
//       .filter((allocation) => allocation.employeeId)
//       .map((allocation) => ({
//         employeeId: allocation.employeeId,
//         projectId: project._id,
//         projectName: project.name,
//         message,
//         type: notificationType,
//         daysRemaining: days,
//         read: false,
//         dismissed: false
//       }));

//     if (notifications.length === 0) {
//       return 0;
//     }

//     await Notification.insertMany(notifications);

//     // Update the correct notification flag
//     if (notificationType === 'warning') {
//       project.notificationSent = {
//         ...project.notificationSent,
//         warningSent: true
//       };
//     } else if (notificationType === 'critical') {
//       project.notificationSent = {
//         ...project.notificationSent,
//         criticalSent: true
//       };
//     } else if (notificationType === 'overdue') {
//       project.notificationSent = {
//         ...project.notificationSent,
//         overdueSent: true
//       };
//     }

//     await project.save();

//     return notifications.length;
//   } catch (error) {
//     console.error(
//       'Error creating deadline notifications:',
//       error.message
//     );

//     return 0;
//   }
// };

// // ============================================
// // 2. GET EMPLOYEE NOTIFICATIONS
// // ============================================
// exports.getNotifications = async (req, res, next) => {
//   try {
//     const employeeId = req.user._id;
//     const { unreadOnly = false } = req.query;

//     const DEFAULT_LIMIT = 20;
//     const MAX_LIMIT = 100;

//     let limit = DEFAULT_LIMIT;

//     if (req.query.limit !== undefined) {
//       const parsed = Number.parseInt(req.query.limit, 10);

//       if (Number.isInteger(parsed) && parsed > 0) {
//         limit = Math.min(parsed, MAX_LIMIT);
//       }
//     }

//     const filter = {
//       employeeId
//     };

//     if (unreadOnly === 'true') {
//       filter.read = false;
//       filter.dismissed = false;
//     }

//     const [notifications, unreadCount] = await Promise.all([
//       Notification.find(filter)
//         .sort({ createdAt: -1 })
//         .limit(limit)
//         .lean(),

//       Notification.countDocuments({
//         employeeId,
//         read: false,
//         dismissed: false
//       })
//     ]);

//     res.status(200).json({
//       notifications,
//       unreadCount,
//       total: notifications.length
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 3. MARK NOTIFICATION AS READ
// // ============================================
// exports.markAsRead = async (req, res, next) => {
//   try {
//     const { notificationId } = req.params;
//     const employeeId = req.user._id;

//     const notification = await Notification.findOne({
//       _id: notificationId,
//       employeeId
//     });

//     if (!notification) {
//       return res.status(404).json({
//         message: 'Notification not found'
//       });
//     }

//     notification.read = true;

//     await notification.save();

//     res.status(200).json({
//       message: 'Notification marked as read'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 4. MARK ALL NOTIFICATIONS AS READ
// // ============================================
// exports.markAllAsRead = async (req, res, next) => {
//   try {
//     const employeeId = req.user._id;

//     await Notification.updateMany(
//       {
//         employeeId,
//         read: false
//       },
//       {
//         $set: {
//           read: true
//         }
//       }
//     );

//     res.status(200).json({
//       message: 'All notifications marked as read'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 5. DISMISS NOTIFICATION
// // ============================================
// exports.dismissNotification = async (req, res, next) => {
//   try {
//     const { notificationId } = req.params;
//     const employeeId = req.user._id;

//     const notification = await Notification.findOne({
//       _id: notificationId,
//       employeeId
//     });

//     if (!notification) {
//       return res.status(404).json({
//         message: 'Notification not found'
//       });
//     }

//     notification.dismissed = true;
//     notification.read = true;

//     await notification.save();

//     res.status(200).json({
//       message: 'Notification dismissed'
//     });
//   } catch (error) {
//     next(error);
//   }
// };
















'use strict';

const Notification = require('../models/Notification');
const Project = require('../models/Project');
const Allocation = require('../models/Allocation');

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
// 1. CREATE NOTIFICATIONS FOR A PROJECT
// ============================================
exports.createDeadlineNotifications = async (projectId) => {
  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return 0;
    }

    if (project.status !== 'active') {
      return 0;
    }

    const days = project.daysUntilDeadline;

    if (days === null || days > 7) {
      return 0;
    }

    const allocations = await Allocation.find({
      projectId,
      organizationId: project.organizationId,
      status: 'active'
    })
      .select('employeeId')
      .lean();

    if (allocations.length === 0) {
      return 0;
    }

    let notificationType = '';
    let message = '';

    if (days < 0) {
      if (project.notificationSent?.overdueSent) {
        return 0;
      }

      notificationType = 'overdue';
      message = `⚠️ Project "${project.name}" is OVERDUE by ${Math.abs(days)} days!`;
    } else if (days <= 3) {
      if (project.notificationSent?.criticalSent) {
        return 0;
      }

      notificationType = 'critical';
      message = `🔴 Project "${project.name}" is due in ${days} days! Immediate attention required.`;
    } else if (days <= 7) {
      if (project.notificationSent?.warningSent) {
        return 0;
      }

      notificationType = 'warning';
      message = `🟡 Project "${project.name}" is approaching deadline in ${days} days.`;
    } else {
      return 0;
    }

    const notifications = allocations
      .filter((allocation) => allocation.employeeId)
      .map((allocation) => ({
        employeeId: allocation.employeeId,
        projectId: project._id,
        organizationId: project.organizationId,
        projectName: project.name,
        message,
        type: notificationType,
        daysRemaining: days,
        read: false,
        dismissed: false
      }));

    if (notifications.length === 0) {
      return 0;
    }

    await Notification.insertMany(notifications);

    if (notificationType === 'warning') {
      project.notificationSent = {
        ...project.notificationSent,
        warningSent: true
      };
    } else if (notificationType === 'critical') {
      project.notificationSent = {
        ...project.notificationSent,
        criticalSent: true
      };
    } else if (notificationType === 'overdue') {
      project.notificationSent = {
        ...project.notificationSent,
        overdueSent: true
      };
    }

    await project.save();

    return notifications.length;
  } catch (error) {
    console.error(
      'Error creating deadline notifications:',
      error.message
    );

    return 0;
  }
};

// ============================================
// 2. GET EMPLOYEE NOTIFICATIONS
// ============================================
exports.getNotifications = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);

    if (!organizationId) return;

    const employeeId = req.user._id;
    const { unreadOnly = false } = req.query;

    const DEFAULT_LIMIT = 20;
    const MAX_LIMIT = 100;

    let limit = DEFAULT_LIMIT;

    if (req.query.limit !== undefined) {
      const parsed = Number.parseInt(
        req.query.limit,
        10
      );

      if (Number.isInteger(parsed) && parsed > 0) {
        limit = Math.min(parsed, MAX_LIMIT);
      }
    }

    const filter = {
      organizationId,
      employeeId
    };

    if (unreadOnly === 'true') {
      filter.read = false;
      filter.dismissed = false;
    }

    const [notifications, unreadCount] =
      await Promise.all([
        Notification.find(filter)
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean(),

        Notification.countDocuments({
          organizationId,
          employeeId,
          read: false,
          dismissed: false
        })
      ]);

    res.status(200).json({
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 3. MARK NOTIFICATION AS READ
// ============================================
exports.markAsRead = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);

    if (!organizationId) return;

    const { notificationId } = req.params;
    const employeeId = req.user._id;

    const notification = await Notification.findOne({
      _id: notificationId,
      organizationId,
      employeeId
    });

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found'
      });
    }

    notification.read = true;

    await notification.save();

    res.status(200).json({
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 4. MARK ALL NOTIFICATIONS AS READ
// ============================================
exports.markAllAsRead = async (req, res, next) => {
  try {
    const organizationId = getOrganizationId(req, res);

    if (!organizationId) return;

    const employeeId = req.user._id;

    await Notification.updateMany(
      {
        organizationId,
        employeeId,
        read: false
      },
      {
        $set: {
          read: true
        }
      }
    );

    res.status(200).json({
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 5. DISMISS NOTIFICATION
// ============================================
exports.dismissNotification = async (
  req,
  res,
  next
) => {
  try {
    const organizationId = getOrganizationId(req, res);

    if (!organizationId) return;

    const { notificationId } = req.params;
    const employeeId = req.user._id;

    const notification = await Notification.findOne({
      _id: notificationId,
      organizationId,
      employeeId
    });

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found'
      });
    }

    notification.dismissed = true;
    notification.read = true;

    await notification.save();

    res.status(200).json({
      message: 'Notification dismissed'
    });
  } catch (error) {
    next(error);
  }
};

