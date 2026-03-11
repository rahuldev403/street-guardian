import mongoose from "mongoose";
import { isStrongPassword } from "validator";
import isEmail from "validator/lib/isEmail";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      validate: {
        validate: (value) => isEmail(value),
        message: "Email format is not valid",
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validate: (value) => isStrongPassword(value),
        message: "password is not strong",
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    subscription: {
      type: String,
      enum: ["none", "monthly", "yearly"],
      default: "none",
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      userId: this._id,
    },
    ENV.jwt_access_secret,
    {
      expiresIn: "15m",
    },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      userId: this._id,
    },
    ENV.jwt_refresh_secret,
    {
      expiresIn: "7d",
    },
  );
};

const User = mongoose.model("User", userSchema);

export default User;
