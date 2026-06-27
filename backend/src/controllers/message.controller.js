import { hasImagekitConfig, uploadChatMedia } from "../lib/imagekit.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { upload } from "../middlewares/upload.middleware.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getUserForSidebar = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id;

  const filteredUsers = await User.find({
    _id: { $ne: loggedInUserId },
  }).select("-clerkId");

  if (filteredUsers.length === 0) {
    throw new ApiError(404, "No users found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, filteredUsers, "Users fetched successfully"));
});

const getConversationsForSidebar = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user?._id;

  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
      },
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ["$senderId", loggedInUserId] },
            "$receiverId",
            "$senderId",
          ],
        },
        lastMessageAt: { $max: "$createdAt" },
      },
    },

    { $sort: { lastMessageAt: -1 } },

    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },

    {
      $replaceRoot: { newRoot: { $first: "$user" } },
    },

    {
      $project: { clerkId: 0 },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(200, conversations, "Converstaion fetched successfully")
    );
});

const getMessages = asyncHandler(async (req, res) => {
  const { id: userToChatId } = req.params;
  const myId = req.user._id;

  const messages = await Message.find({
    $or: [
      {
        senderId: myId,
        receiverId: userToChatId,
      },
      {
        senderId: userToChatId,
        receiverId: myId,
      },
    ],
  }).sort({ createdAt: 1 });

  res
    .status(200)
    .json(new ApiResponse(200, messages, "Full chat fetched successfully"));
});

const sendMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user?._id;

  const receiver = await User.findById(receiverId);

  if (!receiver) {
    throw new ApiError(404, "Receiver not found");
  }

  if (!text?.trim() && !req.file) {
    throw new ApiError(400, "Message text or media is required");
  }

  let imageUrl;
  let videoUrl;
  if (req.file) {
    if (!hasImagekitConfig()) {
      throw new ApiError(500, "Media upload is not configured");
    }
    const url = await uploadChatMedia(req.file);
    if (req.file.mimetype.startsWith("video/")) {
      videoUrl = url;
    } else {
      imageUrl = url;
    }
  }

  const newMessage = new Message({
    senderId,
    receiverId,
    text,
    image: imageUrl,
    video: videoUrl,
  });

  await newMessage.save();

  const receiverSocketId = getReceiverSocketId(receiverId);

  // they will get the socketId of receiver if the receiver is online

  // only send message if the receiver is online
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  res
    .status(201)
    .json(new ApiResponse(201, newMessage, "message send successfully"));
});

export {
  getUserForSidebar,
  getConversationsForSidebar,
  getMessages,
  sendMessage,
};
