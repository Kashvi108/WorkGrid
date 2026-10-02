// const mongoose = require('mongoose');

// const projectSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Project name is required'],
//     trim: true
//   },
//   description: {
//     type: String,
//     trim: true
//   },
//   requiredSkills: {
//     type: [String],
//     default: []
//   },
//   resources: {
//     type: [{
//       label: String,
//       url: String
//     }],
//     default: []
//   },
//   managerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Employee',
//     required: true
//   },
//   startDate: {
//     type: Date,
//     required: [true, 'Start date is required']
//   },
//   endDate: {
//     type: Date,
//     required: [true, 'End date is required']
//   },
//   status: {
//     type: String,
//     enum: ['active', 'on-hold', 'completed', 'archived'],
//     default: 'active'
//   },
//   // ✅ NEW: Alert fields
//   deadlineAlert: {
//     type: Boolean,
//     default: false
//   },
//   alertLevel: {
//     type: String,
//     enum: ['none', 'warning', 'critical','overdue'],
//     default: 'none'
//   },
//   notificationSent: {
//   warningSent: { type: Boolean, default: false },
//   criticalSent: { type: Boolean, default: false },
//   overdueSent: { type: Boolean, default: false } 
// },
  
//   deletedAt: {
//     type: Date,
//     default: null
//   },
//   deletedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Employee'
//   },
//   deletionReason: {
//     type: String,
//     default: ''
//   }
// }, { timestamps: true });

// //  Indexes
// projectSchema.index({ status: 1, deletedAt: 1 });
// projectSchema.index({ endDate: 1 });
// projectSchema.index({ managerId: 1 });

// //  Virtual: days until deadline
// projectSchema.virtual('daysUntilDeadline').get(function() {
//   if (!this.endDate) return null;
//   const now = new Date();
//   const end = new Date(this.endDate);
//   const diffTime = end - now;
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   return diffDays;
// });

// //  Virtual: is deadline approaching
// projectSchema.virtual('isDeadlineApproaching').get(function() {
//   const days = this.daysUntilDeadline;
//   if (days === null) return false;
//   return days >= 0 && days <= 7;
// });

// //  Virtual: deadline status
// projectSchema.virtual('deadlineStatus').get(function() {
//   const days = this.daysUntilDeadline;
//   if (days === null) return 'none';
//   if (days < 0) return 'overdue';
//   if (days <= 3) return 'critical';
//   if (days <= 7) return 'warning';
//   return 'safe';
// });

// // ✅ Ensure virtuals are included in JSON
// projectSchema.set('toJSON', { virtuals: true });
// projectSchema.set('toObject', { virtuals: true });

// module.exports = mongoose.model('Project', projectSchema);

















const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    requiredSkills: {
      type: [String],
      default: []
    },

    resources: {
      type: [
        {
          label: String,
          url: String
        }
      ],
      default: []
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true
    },

    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },

    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },

    status: {
      type: String,
      enum: ['active', 'on-hold', 'completed', 'archived'],
      default: 'active'
    },

    // Alert fields
    deadlineAlert: {
      type: Boolean,
      default: false
    },

    alertLevel: {
      type: String,
      enum: ['none', 'warning', 'critical', 'overdue'],
      default: 'none'
    },

    notificationSent: {
      warningSent: {
        type: Boolean,
        default: false
      },
      criticalSent: {
        type: Boolean,
        default: false
      },
      overdueSent: {
        type: Boolean,
        default: false
      }
    },

    deletedAt: {
      type: Date,
      default: null
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },

    deletionReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Existing indexes
projectSchema.index({ status: 1, deletedAt: 1 });
projectSchema.index({ endDate: 1 });
projectSchema.index({ managerId: 1 });

// Organization-aware queries
projectSchema.index({ organizationId: 1, status: 1, deletedAt: 1 });
projectSchema.index({ organizationId: 1, managerId: 1 });

// Virtual: days until deadline
projectSchema.virtual('daysUntilDeadline').get(function () {
  if (!this.endDate) return null;

  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(
    diffTime / (1000 * 60 * 60 * 24)
  );

  return diffDays;
});

// Virtual: is deadline approaching
projectSchema.virtual('isDeadlineApproaching').get(function () {
  const days = this.daysUntilDeadline;

  if (days === null) return false;

  return days >= 0 && days <= 7;
});

// Virtual: deadline status
projectSchema.virtual('deadlineStatus').get(function () {
  const days = this.daysUntilDeadline;

  if (days === null) return 'none';
  if (days < 0) return 'overdue';
  if (days <= 3) return 'critical';
  if (days <= 7) return 'warning';

  return 'safe';
});

// Ensure virtuals are included in JSON
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);

