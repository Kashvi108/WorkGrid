// const mongoose = require('mongoose');

// const allocationSchema = new mongoose.Schema({
//   employeeId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Employee',
//     required: [true, 'Employee is required']
//   },
//   projectId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Project',
//     required: [true, 'Project is required']
//   },
//   allocatedHours: {
//     type: Number,
//     required: [true, 'Allocated hours is required'],
//     min: [1, 'Allocated hours must be at least 1']
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
//     enum: ['active', 'completed'],
//     default: 'active'
//   },
//   // ✅ NEW: Track why allocation was closed
//   closedReason: {
//     type: String,
//     enum: ['project_archived', 'manual', 'project_completed', 'employee_removed'],
//     default: null
//   },
//   closedAt: {
//     type: Date,
//     default: null
//   }
// }, { timestamps: true });

// // ✅ Indexes for performance
// allocationSchema.index({ employeeId: 1, status: 1 });
// allocationSchema.index({ projectId: 1, status: 1 });

// module.exports = mongoose.model('Allocation', allocationSchema);









const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required']
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required']
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true
    },

    allocatedHours: {
      type: Number,
      required: [true, 'Allocated hours is required'],
      min: [1, 'Allocated hours must be at least 1']
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
      enum: ['active', 'completed'],
      default: 'active'
    },

    // Track why allocation was closed
    closedReason: {
      type: String,
      enum: [
        'project_archived',
        'manual',
        'project_completed',
        'employee_removed'
      ],
      default: null
    },

    closedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Existing indexes
allocationSchema.index({ employeeId: 1, status: 1 });
allocationSchema.index({ projectId: 1, status: 1 });

// Organization-aware indexes
allocationSchema.index({ organizationId: 1, employeeId: 1, status: 1 });
allocationSchema.index({ organizationId: 1, projectId: 1, status: 1 });

module.exports = mongoose.model('Allocation', allocationSchema);

