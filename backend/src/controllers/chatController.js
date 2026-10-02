
// 'use strict';

// const ChatRoom = require('../models/ChatRoom');
// const Message = require('../models/Message');
// const Allocation = require('../models/Allocation');

// // ============================================
// // Helper: check whether a user belongs to room
// // ============================================
// const hasRoomAccess = (chatRoom, userId) => {
//   return chatRoom.employees.some(
//     (employeeId) => employeeId.toString() === userId.toString()
//   );
// };

// // ============================================
// // 1. GET CHAT ROOM FOR A PROJECT
// // ============================================
// exports.getChatRoom = async (req, res, next) => {
//   try {
//     const { projectId } = req.params;
//     const userId = req.user._id;

//     const isAdminOrManager =
//       req.user.role === 'admin' || req.user.role === 'manager';

//     const allocation = await Allocation.findOne({
//       projectId,
//       employeeId: userId,
//       status: 'active'
//     })
//       .select('_id')
//       .lean();

//     if (!allocation && !isAdminOrManager) {
//       return res.status(403).json({
//         message: 'You are not allocated to this project'
//       });
//     }

//     let chatRoom = await ChatRoom.findOne({ projectId });

//     if (!chatRoom) {
//       const allocations = await Allocation.find({
//         projectId,
//         status: 'active'
//       })
//         .select('employeeId')
//         .lean();

//       const employeeIds = allocations
//         .map((allocationItem) => allocationItem.employeeId)
//         .filter(Boolean);

//       const alreadyIncluded = employeeIds.some(
//         (employeeId) => employeeId.toString() === userId.toString()
//       );

//       if (isAdminOrManager && !alreadyIncluded) {
//         employeeIds.push(userId);
//       }

//       chatRoom = await ChatRoom.create({
//         projectId,
//         employees: employeeIds
//       });
//     } else if (!hasRoomAccess(chatRoom, userId)) {
//       chatRoom.employees.push(userId);
//       await chatRoom.save();
//     }

//     res.status(200).json(chatRoom);
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 2. GET ALL MESSAGES FOR A CHAT ROOM
// // ============================================
// exports.getMessages = async (req, res, next) => {
//   try {
//     const { chatRoomId } = req.params;

//     const DEFAULT_LIMIT = 50;
//     const MAX_LIMIT = 100;

//     let page = 1;
//     let limit = DEFAULT_LIMIT;

//     if (req.query.page !== undefined) {
//       const parsedPage = Number.parseInt(req.query.page, 10);

//       if (Number.isInteger(parsedPage) && parsedPage > 0) {
//         page = parsedPage;
//       }
//     }

//     if (req.query.limit !== undefined) {
//       const parsedLimit = Number.parseInt(req.query.limit, 10);

//       if (Number.isInteger(parsedLimit) && parsedLimit > 0) {
//         limit = Math.min(parsedLimit, MAX_LIMIT);
//       }
//     }

//     const skip = (page - 1) * limit;

//     const chatRoom = await ChatRoom.findById(chatRoomId)
//       .select('employees')
//       .lean();

//     if (!chatRoom) {
//       return res.status(404).json({
//         message: 'Chat room not found'
//       });
//     }

//     if (!hasRoomAccess(chatRoom, req.user._id)) {
//       return res.status(403).json({
//         message: 'You do not have access to this chat'
//       });
//     }

//     const messageFilter = {
//       chatRoomId,
//       deletedAt: null
//     };

//     const [messages, total] = await Promise.all([
//       Message.find(messageFilter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate('senderId', 'name email')
//         .populate('readBy', 'name email')
//         .lean(),

//       Message.countDocuments(messageFilter)
//     ]);

//     res.status(200).json({
//       messages: messages.reverse(),
//       total,
//       page,
//       totalPages: Math.ceil(total / limit)
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 3. SEND A NEW MESSAGE
// // ============================================
// exports.sendMessage = async (req, res, next) => {
//   try {
//     const { chatRoomId, content, attachments } = req.body;
//     const userId = req.user._id;

//     const chatRoom = await ChatRoom.findById(chatRoomId);

//     if (!chatRoom) {
//       return res.status(404).json({
//         message: 'Chat room not found'
//       });
//     }

//     if (!hasRoomAccess(chatRoom, userId)) {
//       return res.status(403).json({
//         message: 'You do not have access to this chat'
//       });
//     }

//     const message = await Message.create({
//       chatRoomId,
//       senderId: userId,
//       content,
//       attachments: attachments || [],
//       readBy: [userId]
//     });

//     await message.populate('senderId', 'name email');

//     chatRoom.updatedAt = new Date();
//     await chatRoom.save();

//     const io = req.app.get('io');

//     if (io) {
//       io.to(`room-${chatRoomId}`).emit('newMessage', message);
//     }

//     res.status(201).json(message);
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 4. MARK MESSAGE AS READ
// // ============================================
// exports.markAsRead = async (req, res, next) => {
//   try {
//     const { messageId } = req.params;
//     const userId = req.user._id;

//     const message = await Message.findById(messageId)
//       .select('chatRoomId readBy')
//       .lean();

//     if (!message) {
//       return res.status(404).json({
//         message: 'Message not found'
//       });
//     }

//     const chatRoom = await ChatRoom.findById(message.chatRoomId)
//       .select('employees')
//       .lean();

//     if (!chatRoom || !hasRoomAccess(chatRoom, userId)) {
//       return res.status(403).json({
//         message: 'You do not have access to this chat'
//       });
//     }

//     await Message.updateOne(
//       {
//         _id: messageId,
//         readBy: { $ne: userId }
//       },
//       {
//         $addToSet: { readBy: userId }
//       }
//     );

//     res.status(200).json({
//       message: 'Message marked as read'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 5. MARK ALL MESSAGES AS READ IN A ROOM
// // ============================================
// exports.markAllAsRead = async (req, res, next) => {
//   try {
//     const { chatRoomId } = req.params;
//     const userId = req.user._id;

//     const chatRoom = await ChatRoom.findById(chatRoomId)
//       .select('employees')
//       .lean();

//     if (!chatRoom) {
//       return res.status(404).json({
//         message: 'Chat room not found'
//       });
//     }

//     if (!hasRoomAccess(chatRoom, userId)) {
//       return res.status(403).json({
//         message: 'You do not have access to this chat'
//       });
//     }

//     await Message.updateMany(
//       {
//         chatRoomId,
//         readBy: { $ne: userId }
//       },
//       {
//         $addToSet: { readBy: userId }
//       }
//     );

//     res.status(200).json({
//       message: 'All messages marked as read'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 6. EDIT A MESSAGE
// // ============================================
// exports.editMessage = async (req, res, next) => {
//   try {
//     const { messageId } = req.params;
//     const { content } = req.body;
//     const userId = req.user._id;

//     const message = await Message.findById(messageId);

//     if (!message) {
//       return res.status(404).json({
//         message: 'Message not found'
//       });
//     }

//     if (message.senderId.toString() !== userId.toString()) {
//       return res.status(403).json({
//         message: 'You can only edit your own messages'
//       });
//     }

//     const chatRoom = await ChatRoom.findById(message.chatRoomId)
//       .select('employees')
//       .lean();

//     if (!chatRoom || !hasRoomAccess(chatRoom, userId)) {
//       return res.status(403).json({
//         message: 'You do not have access to this chat'
//       });
//     }

//     const timeSinceSent =
//       Date.now() - new Date(message.createdAt).getTime();

//     const fifteenMinutes = 15 * 60 * 1000;

//     if (timeSinceSent > fifteenMinutes) {
//       return res.status(400).json({
//         message: 'Messages can only be edited within 15 minutes'
//       });
//     }

//     message.content = content;
//     message.isEdited = true;
//     message.editedAt = new Date();

//     await message.save();

//     res.status(200).json(message);
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 7. DELETE A MESSAGE (SOFT DELETE)
// // ============================================
// exports.deleteMessage = async (req, res, next) => {
//   try {
//     const { messageId } = req.params;
//     const userId = req.user._id;

//     const message = await Message.findById(messageId);

//     if (!message) {
//       return res.status(404).json({
//         message: 'Message not found'
//       });
//     }

//     const isAdminOrManager =
//       req.user.role === 'admin' || req.user.role === 'manager';

//     if (
//       message.senderId.toString() !== userId.toString() &&
//       !isAdminOrManager
//     ) {
//       return res.status(403).json({
//         message: 'You can only delete your own messages'
//       });
//     }

//     const chatRoom = await ChatRoom.findById(message.chatRoomId)
//       .select('employees')
//       .lean();

//     if (!chatRoom || !hasRoomAccess(chatRoom, userId)) {
//       return res.status(403).json({
//         message: 'You do not have access to this chat'
//       });
//     }

//     message.deletedAt = new Date();
//     message.content = '[This message was deleted]';

//     await message.save();

//     res.status(200).json({
//       message: 'Message deleted successfully'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 8. ADD EMPLOYEE TO CHAT ROOM (On Allocation)
// // ============================================
// exports.addEmployeeToChatRoom = async (projectId, employeeId) => {
//   try {
//     let chatRoom = await ChatRoom.findOne({ projectId });

//     if (!chatRoom) {
//       chatRoom = await ChatRoom.create({
//         projectId,
//         employees: [employeeId]
//       });
//     } else if (!hasRoomAccess(chatRoom, employeeId)) {
//       chatRoom.employees.push(employeeId);
//       await chatRoom.save();
//     }

//     return chatRoom;
//   } catch (error) {
//     console.error(
//       'Error adding employee to chat room:',
//       error.message
//     );

//     return null;
//   }
// };

// // ============================================
// // 9. REMOVE EMPLOYEE FROM CHAT ROOM (On De-allocation)
// // ============================================
// exports.removeEmployeeFromChatRoom = async (projectId, employeeId) => {
//   try {
//     const chatRoom = await ChatRoom.findOne({ projectId });

//     if (chatRoom) {
//       chatRoom.employees = chatRoom.employees.filter(
//         (id) => id.toString() !== employeeId.toString()
//       );

//       await chatRoom.save();
//     }

//     return chatRoom;
//   } catch (error) {
//     console.error(
//       'Error removing employee from chat room:',
//       error.message
//     );

//     return null;
//   }
// };













'use strict';

const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Allocation = require('../models/Allocation');
const Project = require('../models/Project');
const Employee = require('../models/Employee');

// ============================================
// Helper: get organization ID
// ============================================
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
// Helper: check whether a user belongs to room
// ============================================
const hasRoomAccess = (chatRoom, userId) => {
  return chatRoom.employees.some(
    (employeeId) =>
      employeeId.toString() === userId.toString()
  );
};

// ============================================
// 1. GET CHAT ROOM FOR A PROJECT
// ============================================
exports.getChatRoom = async (req, res, next) => {
  try {
    const organizationId =
      getOrganizationId(req, res);

    if (!organizationId) return;

    const { projectId } = req.params;
    const userId = req.user._id;

    const isAdminOrManager =
      req.user.role === 'admin' ||
      req.user.role === 'manager';

    // Make sure the project belongs to this organization.
    const project = await Project.findOne({
      _id: projectId,
      organizationId
    })
      .select('_id')
      .lean();

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    const allocation = await Allocation.findOne({
      projectId,
      organizationId,
      employeeId: userId,
      status: 'active'
    })
      .select('_id')
      .lean();

    if (!allocation && !isAdminOrManager) {
      return res.status(403).json({
        message: 'You are not allocated to this project'
      });
    }

    let chatRoom = await ChatRoom.findOne({
      projectId,
      organizationId
    });

    if (!chatRoom) {
      const allocations = await Allocation.find({
        projectId,
        organizationId,
        status: 'active'
      })
        .select('employeeId')
        .lean();

      const employeeIds = allocations
        .map(
          (allocationItem) =>
            allocationItem.employeeId
        )
        .filter(Boolean);

      const alreadyIncluded = employeeIds.some(
        (employeeId) =>
          employeeId.toString() === userId.toString()
      );

      if (
        isAdminOrManager &&
        !alreadyIncluded
      ) {
        employeeIds.push(userId);
      }

      chatRoom = await ChatRoom.create({
        projectId,
        organizationId,
        employees: employeeIds
      });
    } else if (
      !hasRoomAccess(chatRoom, userId)
    ) {
      chatRoom.employees.push(userId);
      await chatRoom.save();
    }

    res.status(200).json(chatRoom);
  } catch (error) {
    next(error);
  }
};

// ============================================
// 2. GET ALL MESSAGES FOR A CHAT ROOM
// ============================================
exports.getMessages = async (req, res, next) => {
  try {
    const organizationId =
      getOrganizationId(req, res);

    if (!organizationId) return;

    const { chatRoomId } = req.params;

    const DEFAULT_LIMIT = 50;
    const MAX_LIMIT = 100;

    let page = 1;
    let limit = DEFAULT_LIMIT;

    if (req.query.page !== undefined) {
      const parsedPage =
        Number.parseInt(
          req.query.page,
          10
        );

      if (
        Number.isInteger(parsedPage) &&
        parsedPage > 0
      ) {
        page = parsedPage;
      }
    }

    if (req.query.limit !== undefined) {
      const parsedLimit =
        Number.parseInt(
          req.query.limit,
          10
        );

      if (
        Number.isInteger(parsedLimit) &&
        parsedLimit > 0
      ) {
        limit = Math.min(
          parsedLimit,
          MAX_LIMIT
        );
      }
    }

    const skip = (page - 1) * limit;

    const chatRoom = await ChatRoom.findOne({
      _id: chatRoomId,
      organizationId
    })
      .select('employees')
      .lean();

    if (!chatRoom) {
      return res.status(404).json({
        message: 'Chat room not found'
      });
    }

    if (
      !hasRoomAccess(
        chatRoom,
        req.user._id
      )
    ) {
      return res.status(403).json({
        message: 'You do not have access to this chat'
      });
    }

    const messageFilter = {
      chatRoomId,
      organizationId,
      deletedAt: null
    };

    const [messages, total] =
      await Promise.all([
        Message.find(messageFilter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate(
            'senderId',
            'name email'
          )
          .populate(
            'readBy',
            'name email'
          )
          .lean(),

        Message.countDocuments(
          messageFilter
        )
      ]);

    res.status(200).json({
      messages: messages.reverse(),
      total,
      page,
      totalPages: Math.ceil(
        total / limit
      )
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 3. SEND A NEW MESSAGE
// ============================================
exports.sendMessage = async (req, res, next) => {
  try {
    const organizationId =
      getOrganizationId(req, res);

    if (!organizationId) return;

    const {
      chatRoomId,
      content,
      attachments
    } = req.body;

    const userId = req.user._id;

    const chatRoom =
      await ChatRoom.findOne({
        _id: chatRoomId,
        organizationId
      });

    if (!chatRoom) {
      return res.status(404).json({
        message: 'Chat room not found'
      });
    }

    if (
      !hasRoomAccess(
        chatRoom,
        userId
      )
    ) {
      return res.status(403).json({
        message: 'You do not have access to this chat'
      });
    }

    const message = await Message.create({
      chatRoomId,
      organizationId,
      senderId: userId,
      content,
      attachments:
        attachments || [],
      readBy: [userId]
    });

    await message.populate(
      'senderId',
      'name email'
    );

    chatRoom.updatedAt = new Date();
    await chatRoom.save();

    const io = req.app.get('io');

    if (io) {
      io
        .to(`room-${chatRoomId}`)
        .emit(
          'newMessage',
          message
        );
    }

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

// ============================================
// 4. MARK MESSAGE AS READ
// ============================================
exports.markAsRead = async (req, res, next) => {
  try {
    const organizationId =
      getOrganizationId(req, res);

    if (!organizationId) return;

    const { messageId } = req.params;
    const userId = req.user._id;

    const message =
      await Message.findOne({
        _id: messageId,
        organizationId
      })
        .select(
          'chatRoomId readBy'
        )
        .lean();

    if (!message) {
      return res.status(404).json({
        message: 'Message not found'
      });
    }

    const chatRoom =
      await ChatRoom.findOne({
        _id: message.chatRoomId,
        organizationId
      })
        .select('employees')
        .lean();

    if (
      !chatRoom ||
      !hasRoomAccess(
        chatRoom,
        userId
      )
    ) {
      return res.status(403).json({
        message: 'You do not have access to this chat'
      });
    }

    await Message.updateOne(
      {
        _id: messageId,
        organizationId,
        readBy: { $ne: userId }
      },
      {
        $addToSet: {
          readBy: userId
        }
      }
    );

    res.status(200).json({
      message:
        'Message marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 5. MARK ALL MESSAGES AS READ IN A ROOM
// ============================================
exports.markAllAsRead = async (
  req,
  res,
  next
) => {
  try {
    const organizationId =
      getOrganizationId(req, res);

    if (!organizationId) return;

    const {
      chatRoomId
    } = req.params;

    const userId = req.user._id;

    const chatRoom =
      await ChatRoom.findOne({
        _id: chatRoomId,
        organizationId
      })
        .select('employees')
        .lean();

    if (!chatRoom) {
      return res.status(404).json({
        message: 'Chat room not found'
      });
    }

    if (
      !hasRoomAccess(
        chatRoom,
        userId
      )
    ) {
      return res.status(403).json({
        message: 'You do not have access to this chat'
      });
    }

    await Message.updateMany(
      {
        chatRoomId,
        organizationId,
        readBy: { $ne: userId }
      },
      {
        $addToSet: {
          readBy: userId
        }
      }
    );

    res.status(200).json({
      message:
        'All messages marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 6. EDIT A MESSAGE
// ============================================
exports.editMessage = async (
  req,
  res,
  next
) => {
  try {
    const organizationId =
      getOrganizationId(req, res);

    if (!organizationId) return;

    const {
      messageId
    } = req.params;

    const { content } = req.body;
    const userId = req.user._id;

    const message =
      await Message.findOne({
        _id: messageId,
        organizationId
      });

    if (!message) {
      return res.status(404).json({
        message: 'Message not found'
      });
    }

    if (
      message.senderId.toString() !==
      userId.toString()
    ) {
      return res.status(403).json({
        message:
          'You can only edit your own messages'
      });
    }

    const chatRoom =
      await ChatRoom.findOne({
        _id: message.chatRoomId,
        organizationId
      })
        .select('employees')
        .lean();

    if (
      !chatRoom ||
      !hasRoomAccess(
        chatRoom,
        userId
      )
    ) {
      return res.status(403).json({
        message:
          'You do not have access to this chat'
      });
    }

    const timeSinceSent =
      Date.now() -
      new Date(
        message.createdAt
      ).getTime();

    const fifteenMinutes =
      15 * 60 * 1000;

    if (
      timeSinceSent >
      fifteenMinutes
    ) {
      return res.status(400).json({
        message:
          'Messages can only be edited within 15 minutes'
      });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();

    res.status(200).json(message);
  } catch (error) {
    next(error);
  }
};

// ============================================
// 7. DELETE A MESSAGE (SOFT DELETE)
// ============================================
exports.deleteMessage = async (
  req,
  res,
  next
) => {
  try {
    const organizationId =
      getOrganizationId(req, res);

    if (!organizationId) return;

    const {
      messageId
    } = req.params;

    const userId = req.user._id;

    const message =
      await Message.findOne({
        _id: messageId,
        organizationId
      });

    if (!message) {
      return res.status(404).json({
        message: 'Message not found'
      });
    }

    const isAdminOrManager =
      req.user.role === 'admin' ||
      req.user.role === 'manager';

    if (
      message.senderId.toString() !==
        userId.toString() &&
      !isAdminOrManager
    ) {
      return res.status(403).json({
        message:
          'You can only delete your own messages'
      });
    }

    const chatRoom =
      await ChatRoom.findOne({
        _id: message.chatRoomId,
        organizationId
      })
        .select('employees')
        .lean();

    if (
      !chatRoom ||
      !hasRoomAccess(
        chatRoom,
        userId
      )
    ) {
      return res.status(403).json({
        message:
          'You do not have access to this chat'
      });
    }

    message.deletedAt =
      new Date();

    message.content =
      '[This message was deleted]';

    await message.save();

    res.status(200).json({
      message:
        'Message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 8. ADD EMPLOYEE TO CHAT ROOM
//    (On Allocation)
// ============================================
exports.addEmployeeToChatRoom = async (
  projectId,
  employeeId
) => {
  try {
    const project =
      await Project.findById(
        projectId
      )
        .select(
          'organizationId'
        )
        .lean();

    if (!project?.organizationId) {
      return null;
    }

    const employee =
      await Employee.findOne({
        _id: employeeId,
        organizationId:
          project.organizationId
      })
        .select('_id')
        .lean();

    if (!employee) {
      return null;
    }

    let chatRoom =
      await ChatRoom.findOne({
        projectId,
        organizationId:
          project.organizationId
      });

    if (!chatRoom) {
      chatRoom =
        await ChatRoom.create({
          projectId,
          organizationId:
            project.organizationId,
          employees: [
            employeeId
          ]
        });
    } else if (
      !hasRoomAccess(
        chatRoom,
        employeeId
      )
    ) {
      chatRoom.employees.push(
        employeeId
      );

      await chatRoom.save();
    }

    return chatRoom;
  } catch (error) {
    console.error(
      'Error adding employee to chat room:',
      error.message
    );

    return null;
  }
};

// ============================================
// 9. REMOVE EMPLOYEE FROM CHAT ROOM
//    (On De-allocation)
// ============================================
exports.removeEmployeeFromChatRoom =
  async (
    projectId,
    employeeId
  ) => {
    try {
      const project =
        await Project.findById(
          projectId
        )
          .select(
            'organizationId'
          )
          .lean();

      if (!project?.organizationId) {
        return null;
      }

      const chatRoom =
        await ChatRoom.findOne({
          projectId,
          organizationId:
            project.organizationId
        });

      if (chatRoom) {
        chatRoom.employees =
          chatRoom.employees.filter(
            (id) =>
              id.toString() !==
              employeeId.toString()
          );

        await chatRoom.save();
      }

      return chatRoom;
    } catch (error) {
      console.error(
        'Error removing employee from chat room:',
        error.message
      );

      return null;
    }
  };

