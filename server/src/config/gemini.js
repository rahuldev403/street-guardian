import axios from "axios";
import { ENV } from "./env.js";
import ApiError from "../utils/ApiError.js";

const api_key = ENV.gemini_key;
const url =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
export const geminiService = async (incidentPrompt) => {
  if (!api_key) {
    throw new ApiError(500, "Gemini API key is missing");
  }
  const requrestedData = {
    contents: [
      {
        parts: [{ text: incidentPrompt }],
      },
    ],
  };
  const response = await axios.post(url, requrestedData, {
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      key: api_key,
    },
  });
  return response;
};
