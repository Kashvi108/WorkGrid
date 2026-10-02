// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const employeeSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Name is required'],
//     trim: true
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   password: {
//     type: String,
//     required: [true, 'Password is required'],
//     minlength: 6
//   },
//   role: {
//     type: String,
//     enum: ['admin', 'manager', 'employee'],
//     default: 'employee'
//   },
//   skills: {
//     type: [String],
//     default: []
//   },
//   department: {
//     type: String,
//     trim: true
//   },
//   capacityHours: {
//     type: Number,
//     default: 40,
//     min: 0
//   }
// }, { timestamps: true });


// employeeSchema.pre('save', async function () {
//   if (!this.isModified('password')) {
//     return;
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// module.exports = mongoose.model('Employee', employeeSchema);



















const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6
    },

    role: {
      type: String,
      enum: ['admin', 'manager', 'employee'],
      default: 'employee'
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true
    },

    skills: {
      type: [String],
      default: []
    },

    department: {
      type: String,
      trim: true
    },

    capacityHours: {
      type: Number,
      default: 40,
      min: 0
    }
  },
  { timestamps: true }
);

employeeSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('Employee', employeeSchema);
