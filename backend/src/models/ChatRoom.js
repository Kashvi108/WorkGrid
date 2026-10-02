// const mongoose = require('mongoose');

// const chatRoomSchema = new mongoose.Schema({
//   projectId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Project',
//     required: true,
//     unique: true // ✅ This already creates an index
//   },
//   employees: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Employee'
//   }],
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// }, { timestamps: true });

// // ✅ REMOVE THIS LINE — it's duplicating the index
// // chatRoomSchema.index({ projectId: 1 });

// // ✅ Auto-update updatedAt on save
// // chatRoomSchema.pre('save', function(next) {
//   // this.updatedAt = Date.now();
//   // next();
// // });

// module.exports = mongoose.model('ChatRoom', chatRoomSchema);













const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      unique: true
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true
    },

    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
      }
    ],

    createdAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Organization-aware lookup
chatRoomSchema.index({
  organizationId: 1,
  projectId: 1
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);

