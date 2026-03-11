import { ENV } from "../config/env.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiRersponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const isProduction = ENV.node_env === "production";

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new ApiError(401, "No active session");
  }
  const decoded = jwt.verify(refreshToken, ENV.jwt_refresh_secret);
  const user = await User.findById(decoded.userId);
  if (!user || user.refreshToken != refreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }
  const newAccessToken = user.generateAccessToken();
  const accessTokenOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: 15 * 60 * 1000,
  };

  return res
    .cookie("accessToken", newAccessToken, accessTokenOptions)
    .json(new ApiResponse(200, null, "accesstoken refresh successfull"));
});
export const sigUp = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!name || !email || !password) {
    throw new ApiError(401, "All feilds are required");
  }
  if (!validator.isEmail(normalizedEmail)) {
    throw new ApiError(400, "Email is not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw new ApiError(400, "Password is weak");
  }
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(400, "User already exist");
  }
  const newUser = await User.create({
    name,
    email: normalizedEmail,
    password,
  });
  const accessToken = newUser.generateAccessToken();
  const refreshToken = newUser.generateRefreshToken();

  newUser.refreshToken = refreshToken;
  await newUser.save();

  const accessTokenOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: 15 * 60 * 1000,
  };
  const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  const safeUser = newUser.toObject();
  delete safeUser.password;
  delete safeUser.refreshToken;

  return res
    .status(201)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .json(new ApiResponse(201, safeUser, "User signup successfull"));
});

export const signIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!email || !password) {
    throw new ApiError(400, "all feilds are required");
  }

  if (!validator.isEmail(normalizedEmail)) {
    throw new ApiError(400, "invalid email format");
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new ApiError(400, "user not found");
  }
  const isPasswordCorrect = bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "invalid credentials");
  }
  const accessToken = user.generateAccessToken();
  const refreshtoken = user.generateRefreshToken();
  user.refreshToken = refreshtoken;
  user.save({ validateBeforeSave: true });

  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.refreshToken;

  const accessTokenOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: 15 * 60 * 1000,
  };
  const refreshTokenOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshtoken, refreshTokenOptions)
    .json(new ApiResponse(200, safeUser, "user signin successfully"));
});
export const signOut = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(new ApiResponse(200, null, "user signedout successfully"));
});
