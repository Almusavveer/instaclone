// =========================================
// backend/src/controllers/message.controllers.js
// =========================================

const Message = require("../model/chat");

const User = require("../model/user");

const Notification = require(
  "../model/Notification"
);

const {
  getIO,
} = require("../socket");

/* =========================================
   SEND MESSAGE
========================================= */
const sendMessage = async (
  req,
  res
) => {

  try {

    const user =
      await User.findOne({
        email: req.user.email,
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const senderId = user._id;

    const {
      receiverId,
      message,
    } = req.body;

    if (
      !receiverId ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Receiver and message required",
      });
    }

    // CHECK CHAT ACCEPTED
    const isAllowed =
      await Notification.findOne({
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
        message:
          "Chat request not accepted",
      });
    }

    // CREATE MESSAGE
    const newMessage =
      await Message.create({
        sender: senderId,
        receiver: receiverId,
        message,
      });

    // POPULATE
    const populatedMessage =
      await Message.findById(
        newMessage._id
      ).populate(
        "sender",
        "name avatar"
      );

    // SOCKET EMIT
    const io = getIO();

    io.emit(
      "receive_message",
      populatedMessage
    );

    return res.status(201).json({
      success: true,
      data: populatedMessage,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================================
   SEND CHAT REQUEST
========================================= */
const sendChatRequest = async (
  req,
  res
) => {

  try {

    const user =
      await User.findOne({
        email: req.user.email,
      });

    const senderId = user._id;

    const {
      receiverId,
    } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message:
          "Receiver required",
      });
    }

    // CHECK EXISTING
    const existing =
      await Notification.findOne({
        $or: [
          {
            sender: senderId,
            receiver: receiverId,
          },
          {
            sender: receiverId,
            receiver: senderId,
          },
        ],
      });

    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          "Request already exists",
      });
    }

    // CREATE REQUEST
    const request =
      await Notification.create({
        sender: senderId,
        receiver: receiverId,
        type: "CHAT_REQUEST",
        status: "PENDING",
      });

    return res.status(201).json({
      success: true,
      data: request,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================================
   ACCEPT CHAT REQUEST
========================================= */
const acceptChatRequest =
  async (req, res) => {

    try {

      const user =
        await User.findOne({
          email: req.user.email,
        });

      const receiverId =
        user._id;

      const {
        requestId,
      } = req.body;

      const request =
        await Notification.findById(
          requestId
        );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Request not found",
        });
      }

      if (
        request.receiver.toString() !==
        receiverId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Not allowed",
        });
      }

      request.status =
        "ACCEPTED";

      await request.save();

      return res.status(200).json({
        success: true,
        message:
          "Request accepted",
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Server error",
      });
    }
  };

/* =========================================
   GET NOTIFICATIONS
========================================= */
const getNotifications =
  async (req, res) => {

    try {

      const user =
        await User.findOne({
          email: req.user.email,
        });

      const notifications =
        await Notification.find({
          receiver: user._id,
          status: "PENDING",
        }).populate(
          "sender",
          "name avatar"
        );

      return res.json({
        success: true,
        data: notifications,
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Server error",
      });
    }
  };

/* =========================================
   CHECK STATUS
========================================= */
const checkChatStatus =
  async (req, res) => {

    try {

      const user =
        await User.findOne({
          email: req.user.email,
        });

      const senderId =
        user._id;

      const receiverId =
        req.params.receiverId;

      const request =
        await Notification.findOne({
          $or: [
            {
              sender: senderId,
              receiver: receiverId,
            },
            {
              sender: receiverId,
              receiver: senderId,
            },
          ],
        });

      return res.json({
        success: true,
        status: request
          ? request.status
          : "NONE",
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Server error",
      });
    }
  };

/* =========================================
   GET MESSAGES
========================================= */
const getMessages = async (
  req,
  res
) => {

  try {

    const user =
      await User.findOne({
        email: req.user.email,
      });

    const userId =
      user._id;

    const receiverId =
      req.params.receiverId;

    const messages =
      await Message.find({
        $or: [
          {
            sender: userId,
            receiver: receiverId,
          },
          {
            sender: receiverId,
            receiver: userId,
          },
        ],
      })
        .populate(
          "sender",
          "name avatar"
        )
        .sort({
          createdAt: 1,
        });

    return res.json({
      success: true,
      data: messages,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message:
        "Server error",
    });
  }
};

module.exports = {
  sendMessage,
  sendChatRequest,
  acceptChatRequest,
  getNotifications,
  checkChatStatus,
  getMessages,
};