import axios from "axios";
import { ENV } from "./env.js";
import ApiError from "../utils/ApiError.js";

const api_key = ENV.gemini_key;
const model = ENV.gemini_model || "gemini-2.0-flash";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

export const geminiService = async (incidentPrompt) => {
  if (!api_key) {
    throw new ApiError(500, "Gemini API key is missing");
  }
  const requestedData = {
    contents: [
      {
        parts: [{ text: incidentPrompt }],
      },
    ],
  };

  const response = await axios.post(url, requestedData, {
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      key: api_key,
    },
    timeout: 15000,
  });

  return response;
};
