import mongoose from "mongoose";
import { ENV } from "./env.js";

const connectDb = () => {
  try {
    mongoose.connect(ENV.db_url);
    console.log("db connection successfull 🎉");
  } catch (error) {
    console.log("error connecting to database 🫨 : ", error);
  }
};

export default connectDb;
