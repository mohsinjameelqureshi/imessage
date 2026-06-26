import { hasImagekitConfig, uploadChatMedia } from "../lib/imagekit.js";
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
  //   const { text } = req.body;
  //   const { id: receiverId } = req.params;
  //   const senderId = req.user?._id;
  //   let imageUrl;
  //   let videoUrl;
  //   if (req.file) {
  //     if (!hasImagekitConfig()) {
  //       throw new ApiError(500, "Media upload is not configured");
  //     }
  //     const url = await uploadChatMedia(req.file);
  //     if (req.file.mimetype.startsWith("video/")) {
  //       videoUrl = url;
  //     } else {
  //       imageUrl = url;
  //     }
  //   }
});

export {
  getUserForSidebar,
  getConversationsForSidebar,
  getMessages,
  sendMessage,
};
