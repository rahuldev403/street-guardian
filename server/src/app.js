import express from "express";
import cookieParser from "cookie-parser";
// creating the Express app
export const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());
// CORS

// routes

// global error handler

// rate limiting

// body parsing

