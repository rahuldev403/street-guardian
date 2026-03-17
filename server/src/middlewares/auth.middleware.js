import { ENV } from "../config/env.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const requireAuth = asyncHandler(async (req, res, next) => {
  const accessTokenFromCookies = req.cookies?.accessToken;
  const accessTokenFromHeader = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  const accessToken = accessTokenFromCookies || accessTokenFromHeader;
  if (!accessToken) {
    throw new ApiError(401, "Authentication required");
  }
  let decoded;
  try {
    decoded = jwt.verify(accessToken, ENV.jwt_access_secret);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token");
  }
  const user = await User.findById(decoded.userId).select("_id name email");
  if (!user) throw new ApiError(401, "User no longer exists");
  req.user = user;
  next();
});
