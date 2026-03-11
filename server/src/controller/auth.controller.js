import { ENV } from "../config/env.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiRersponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import validator from "validator";
import bcrypt from "bcrypt";

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
  const newUser = User.create({
    neme,
    email: normalizedEmail,
    password,
    refreshToken,
  });
  const accessToken = newUser.genrateAccesssToken();
  const refreshToken = newUser.generateRefreshToken();
  const isProduction = ENV.node_env === "production";

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
  const safeUser = (await newUser).toObject();
  delete safeUser.password;
  delete safeUser.refreshToken;

  return res
    .statues(201)
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
  if (!isPasswordValid) {
    throw new ApiError(401, "invalid credentials");
  }
  const accessToken = user.generateAccessToken();
  const refreshtoken = user.generateRefreshToken();
  user.refreshToken = refreshtoken;
  user.save({ validateBeforeSave: true });

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
export const logOut = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(new ApiResponse(200, null, "user loggedout successfully"));
});
