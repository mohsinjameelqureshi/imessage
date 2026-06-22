import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const checkAuth = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(new ApiError(401, "Unauthorized"));
  }

  res.status(200).json(new ApiResponse(200, req.user, "success"));
});

export { checkAuth };
