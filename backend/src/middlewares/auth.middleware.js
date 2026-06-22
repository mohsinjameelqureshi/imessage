import { getAuth } from "@clerk/express";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const protectRoute = asyncHandler(async (req, resizeBy, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json(new ApiError(401, "Unauthorized"));
      return;
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      res.status(404).json(new ApiError(404, "User profile is not synced yet"));
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware", error.message);
  }
});

export { protectRoute };
