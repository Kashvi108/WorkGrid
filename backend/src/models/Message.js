// const mongoose = require('mongoose');

// const messageSchema = new mongoose.Schema(
//   {
//     chatRoomId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'ChatRoom',
//       required: true
//     },

//     senderId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Employee',
//       required: true
//     },

//     content: {
//       type: String,
//       required: [true, 'Message content is required'],
//       trim: true,
//       maxlength: [2000, 'Message cannot exceed 2000 characters']
//     },

//     readBy: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Employee'
//       }
//     ],

//     attachments: [
//       {
//         fileName: String,
//         fileUrl: String,
//         fileType: String,
//         fileSize: Number
//       }
//     ],

//     isEdited: {
//       type: Boolean,
//       default: false
//     },

//     editedAt: {
//       type: Date,
//       default: null
//     },

//     deletedAt: {
//       type: Date,
//       default: null
//     }
//   },
//   { timestamps: true }
// );

// // Optimized for chat-room message pagination
// // with soft-deleted messages excluded.
// messageSchema.index({
//   chatRoomId: 1,
//   deletedAt: 1,
//   createdAt: -1
// });

// messageSchema.index({ senderId: 1 });

// messageSchema.index({ readBy: 1 });

// messageSchema.virtual('replyCount', {
//   ref: 'Reply',
//   localField: '_id',
//   foreignField: 'parentMessageId',
//   count: true
// });

// messageSchema.set('toJSON', { virtuals: true });
// messageSchema.set('toObject', { virtuals: true });

// module.exports = mongoose.model('Message', messageSchema);













const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },

    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
      }
    ],

    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        fileSize: Number
      }
    ],

    isEdited: {
      type: Boolean,
      default: false
    },

    editedAt: {
      type: Date,
      default: null
    },

    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Existing optimized chat-room pagination index
messageSchema.index({
  chatRoomId: 1,
  deletedAt: 1,
  createdAt: -1
});

// Organization-aware chat pagination
messageSchema.index({
  organizationId: 1,
  chatRoomId: 1,
  deletedAt: 1,
  createdAt: -1
});

messageSchema.index({ senderId: 1 });

messageSchema.index({ readBy: 1 });

messageSchema.virtual('replyCount', {
  ref: 'Reply',
  localField: '_id',
  foreignField: 'parentMessageId',
  count: true
});

messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Message', messageSchema);

