const cron = require('node-cron');
const Project = require('../models/Project');
const Allocation = require('../models/Allocation');
const Notification = require('../models/Notification');

// ============================================
// DAILY DEADLINE CHECK
// ============================================
const checkDeadlines = async () => {
  console.log('🔄 Running daily deadline check...');

  try {
    // ✅ Build date boundaries
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysFromToday = new Date(startOfToday);
    sevenDaysFromToday.setDate(sevenDaysFromToday.getDate() + 7);
    sevenDaysFromToday.setHours(23, 59, 59, 999);

    // ✅ Find active, non-deleted projects:
    //    - overdue (endDate in the past)
    //    - warning/critical (endDate within the next 7 days)
    //    - exclude anything more than 7 days out
    const projects = await Project.find({
      status: 'active',
      deletedAt: null,
      endDate: { $lte: sevenDaysFromToday }
    });

    console.log(`📊 Found ${projects.length} active projects to check`);

    // ✅ PASS 1: Determine which projects actually need a notification
    //    (and cache the computed notification type/message/days)
    const pendingNotifications = [];

    for (const project of projects) {
      const days = project.daysUntilDeadline;

      if (days === null) continue;

      let shouldSend = false;
      let notificationType = '';
      let message = '';

      if (days < 0) {
        if (!project.notificationSent?.overdueSent) {
          shouldSend = true;
          notificationType = 'overdue';
          message = `⚠️ Project "${project.name}" is OVERDUE by ${Math.abs(days)} days!`;
        }
      } else if (days <= 3) {
        if (!project.notificationSent?.criticalSent) {
          shouldSend = true;
          notificationType = 'critical';
          message = `🔴 Project "${project.name}" is due in ${days} days! Immediate attention required.`;
        }
      } else if (days <= 7) {
        if (!project.notificationSent?.warningSent) {
          shouldSend = true;
          notificationType = 'warning';
          message = `🟡 Project "${project.name}" is approaching deadline in ${days} days.`;
        }
      }

      if (!shouldSend) continue;

      pendingNotifications.push({
        project,
        days,
        notificationType,
        message
      });
    }

    // ✅ If nothing needs a notification, exit early
    if (pendingNotifications.length === 0) {
      console.log('✅ Daily deadline check completed. Created 0 notifications.');
      return;
    }

    // ✅ PASS 2: Fetch all active allocations for those projects in ONE query
    const projectIds = pendingNotifications.map(p => p.project._id);

    const allAllocations = await Allocation.find({
      projectId: { $in: projectIds },
      status: 'active'
    }).select('employeeId projectId');

    // ✅ Group allocations by projectId in memory
    const allocationsByProject = new Map();
    for (const alloc of allAllocations) {
      const key = alloc.projectId.toString();
      if (!allocationsByProject.has(key)) {
        allocationsByProject.set(key, []);
      }
      allocationsByProject.get(key).push(alloc);
    }

    // ✅ PASS 3: Process each pending project using the in-memory map
    let notificationsCreated = 0;

    for (const { project, days, notificationType, message } of pendingNotifications) {
      const allocations = allocationsByProject.get(project._id.toString()) || [];

      // ✅ Preserve existing behavior: skip projects with no active allocations
      if (allocations.length === 0) continue;

      // ✅ Create notifications using the raw ObjectId (no populate needed)
      const notifications = allocations.map(alloc => ({
        employeeId: alloc.employeeId,
        projectId: project._id,
        projectName: project.name,
        message,
        type: notificationType,
        daysRemaining: days,
        read: false,
        dismissed: false
      }));

      await Notification.insertMany(notifications);
      notificationsCreated += notifications.length;

      // ✅ Update project notification flags
      if (notificationType === 'overdue') {
        project.notificationSent = {
          ...project.notificationSent,
          overdueSent: true
        };
      } else if (notificationType === 'critical') {
        project.notificationSent = {
          ...project.notificationSent,
          criticalSent: true
        };
      } else if (notificationType === 'warning') {
        project.notificationSent = {
          ...project.notificationSent,
          warningSent: true
        };
      }
      await project.save();

      console.log(`📬 Created ${notifications.length} ${notificationType} notifications for "${project.name}"`);
    }

    console.log(`✅ Daily deadline check completed. Created ${notificationsCreated} notifications.`);
  } catch (error) {
    console.error('❌ Error in daily deadline check:', error.message);
  }
};

// ============================================
// SCHEDULE CRON JOB - Runs at 9:00 AM every day
// ============================================
const scheduleDeadlineCheck = () => {
  // ✅ Runs at 9:00 AM every day
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Cron job triggered at 9:00 AM');
    await checkDeadlines();
  });

  console.log('⏰ Daily deadline check scheduled for 9:00 AM');
};

// ============================================
// EXPORT
// ============================================
module.exports = {
  checkDeadlines,
  scheduleDeadlineCheck
};