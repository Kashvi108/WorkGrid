// const mongoose = require('mongoose');

// const notificationSchema = new mongoose.Schema({
//   employeeId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Employee',
//     required: true
//   },
//   projectId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Project',
//     required: true
//   },
//   projectName: {
//     type: String,
//     required: true
//   },
//   message: {
//     type: String,
//     required: true
//   },
//   type: {
//     type: String,
//     enum: ['warning', 'critical', 'overdue', 'deleted', 'chat'],
//     required: true
//   },
//   daysRemaining: {
//     type: Number,
//     required: true
//   },
//   read: {
//     type: Boolean,
//     default: false
//   },
//   dismissed: {
//     type: Boolean,
//     default: false
//   },
//   chatMessageId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Message',
//     default: null
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// // ✅ Index 1: fetch an employee's notifications, newest first
// notificationSchema.index({ employeeId: 1, createdAt: -1 });

// // ✅ Index 2: unread / non-dismissed filtering and unreadCount queries
// notificationSchema.index({ employeeId: 1, read: 1, dismissed: 1 });

// module.exports = mongoose.model('Notification', notificationSchema);












const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true
    },

    projectName: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: [
        'warning',
        'critical',
        'overdue',
        'deleted',
        'chat'
      ],
      required: true
    },

    daysRemaining: {
      type: Number,
      required: true
    },

    read: {
      type: Boolean,
      default: false
    },

    dismissed: {
      type: Boolean,
      default: false
    },

    chatMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

// Existing access pattern
notificationSchema.index({
  employeeId: 1,
  createdAt: -1
});

notificationSchema.index({
  employeeId: 1,
  read: 1,
  dismissed: 1
});

// Tenant-aware indexes
notificationSchema.index({
  organizationId: 1,
  employeeId: 1,
  createdAt: -1
});

notificationSchema.index({
  organizationId: 1,
  employeeId: 1,
  read: 1,
  dismissed: 1
});

module.exports = mongoose.model(
  'Notification',
  notificationSchema
);

