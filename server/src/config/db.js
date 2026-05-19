import config from "./index.js";
import mongoose from "mongoose";
import logger from "../lib/winston.js";

mongoose.set("strictQuery", true);

if (!config.MONGO_URI) {
  throw new Error("MONGO_URI is not set in .env");
}

export function connect(options = {}) {
  return mongoose
    .connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      ...options,
    })
    .catch((err) => {
      if (err.message?.includes("auth")) {
        logger.error(
          "[MongoDB] Auth failed. Check: special chars in password need URL-encoding (@ -> %40, # -> %23), and no spaces around = in .env"
        );
      }
      throw err;
    });
}
