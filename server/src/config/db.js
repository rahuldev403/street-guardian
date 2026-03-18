import mongoose from "mongoose";
import { ENV } from "./env.js";

const connectDb = async () => {
  try {
    if (!ENV.db_url) {
      throw new Error("MONGO_URL is missing");
    }

    await mongoose.connect(ENV.db_url, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      tls: true,
    });

    console.log("db connection successful 🎉");
  } catch (error) {
    console.error("error connecting to database 🫨:", error.message);
    throw error;
  }
};

export default connectDb;
