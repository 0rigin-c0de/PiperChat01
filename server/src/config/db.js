import config from "./index.js";
import mongoose from "mongoose";

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
        console.error(
          "[MongoDB] Auth failed. Check: special chars in password need URL-encoding (@ → %40, # → %23), and no spaces around = in .env"
        );
      }
      throw err;
    });
}
