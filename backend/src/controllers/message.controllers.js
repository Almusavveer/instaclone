const Message = require("../model/chat");
const User = require("../model/user");
const Notification = require("../model/Notification");

/* =========================
   SEND MESSAGE
========================= */
const sendMessage = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.user.email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const senderId = user._id;
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: "Receiver and message are required",
      });
    }

    const isAllowed = await Notification.findOne({
      $or: [
        {
          sender: senderId,
          receiver: receiverId,
          status: "ACCEPTED",
        },
        {
          sender: receiverId,
          receiver: senderId,
          status: "ACCEPTED",
        },
      ],
    });

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "You cannot send message until request is accepted",
      });
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================
   SEND CHAT REQUEST (MISSING BEFORE ❌)
========================= */
const sendChatRequest = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.user.email,
    });

    const senderId = user._id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver required",
      });
    }

    // ❌ BLOCK ANY EXISTING REQUEST (IMPORTANT FIX)
    const existing = await Notification.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Chat request already exists or already accepted",
      });
    }

    const request = await Notification.create({
      sender: senderId,
      receiver: receiverId,
      type: "CHAT_REQUEST",
      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Chat request sent",
      data: request,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================
   ACCEPT CHAT REQUEST
========================= */
const acceptChatRequest = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.user.email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const receiverId = user._id;
    const { requestId } = req.body;

    const request = await Notification.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.receiver.toString() !== receiverId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    request.status = "ACCEPTED";
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Request accepted, now chat is allowed",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================
   GET NOTIFICATIONS
========================= */
const getNotifications = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.user.email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const notifications = await Notification.find({
      receiver: user._id,
      status: "PENDING",
    }).populate("sender", "name avatar");

    return res.json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const checkChatStatus = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.user.email,
    });

    const senderId = user._id;
    const receiverId = req.params.receiverId;

    const request = await Notification.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    return res.json({
      success: true,
      status: request ? request.status : "NONE",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// const getMessages = async (req, res) => {
//   try {
//     const user = await User.findOne({
//       email: req.user.email,
//     });

//     const userId = user._id;
//     const receiverId = req.params.receiverId;

//     const messages = await Message.find({
//       $or: [
//         { sender: userId, receiver: receiverId },
//         { sender: receiverId, receiver: userId },
//       ],
//     }).sort({ createdAt: 1 }); // oldest → newest

//     return res.json({
//       success: true,
//       data: messages,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }

const getMessages = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.user.email,
    });

    const userId = user._id;
    const receiverId = req.params.receiverId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    })
      .populate("sender", "name avatar") // 🔥 MUST FIX
      .sort({ createdAt: 1 });

    return res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================
   EXPORT ALL
========================= */
module.exports = {
  sendMessage,
  sendChatRequest,
  acceptChatRequest,
  getNotifications,
  checkChatStatus,
  getMessages
};