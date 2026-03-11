import express from "express";
import {
  refresh,
  signIn,
  signOut,
  sigUp,
} from "../controller/auth.controller.js";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middlewares/auth.middleware.js";

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "too many login requrests,try again later",
});

const authRoute = express.Router();

authRoute.post("/signup", sigUp);
authRoute.post("/signin", authLimiter, signIn);
authRoute.post("/refresh", refresh);
authRoute.post("/signout", signOut);
authRoute.get("/me", requireAuth, (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Authenticated user"));
});
export default authRoute;
