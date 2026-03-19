import express from "express";
import jwt from "jsonwebtoken";

import { authToken } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function isValidUsername(value) {
  if (!value) return false;
  if (value.length < 2 || value.length > 32) return false;
  return true;
}

function isValidProfilePicUrl(value) {
  if (!value) return true;
  if (typeof value !== "string") return false;
  if (value.length > 2048) return false;
  if (value.startsWith("http://") || value.startsWith("https://")) return true;
  return false;
}

async function propagateUserIdentity({ userId, username, profile_pic }) {
  const arrayUpdates = [];

  if (username !== undefined) {
    arrayUpdates.push(
      User.updateMany(
        { "incoming_reqs.id": String(userId) },
        { $set: { "incoming_reqs.$[entry].username": username } },
        { arrayFilters: [{ "entry.id": String(userId) }] }
      )
    );
    arrayUpdates.push(
      User.updateMany(
        { "outgoing_reqs.id": String(userId) },
        { $set: { "outgoing_reqs.$[entry].username": username } },
        { arrayFilters: [{ "entry.id": String(userId) }] }
      )
    );
    arrayUpdates.push(
      User.updateMany(
        { "friends.id": String(userId) },
        { $set: { "friends.$[entry].username": username } },
        { arrayFilters: [{ "entry.id": String(userId) }] }
      )
    );
    arrayUpdates.push(
      User.updateMany(
        { "blocked.id": String(userId) },
        { $set: { "blocked.$[entry].username": username } },
        { arrayFilters: [{ "entry.id": String(userId) }] }
      )
    );
  }

  if (profile_pic !== undefined) {
    arrayUpdates.push(
      User.updateMany(
        { "incoming_reqs.id": String(userId) },
        { $set: { "incoming_reqs.$[entry].profile_pic": profile_pic } },
        { arrayFilters: [{ "entry.id": String(userId) }] }
      )
    );
    arrayUpdates.push(
      User.updateMany(
        { "outgoing_reqs.id": String(userId) },
        { $set: { "outgoing_reqs.$[entry].profile_pic": profile_pic } },
        { arrayFilters: [{ "entry.id": String(userId) }] }
      )
    );
    arrayUpdates.push(
      User.updateMany(
        { "friends.id": String(userId) },
        { $set: { "friends.$[entry].profile_pic": profile_pic } },
        { arrayFilters: [{ "entry.id": String(userId) }] }
      )
    );
    arrayUpdates.push(
      User.updateMany(
        { "blocked.id": String(userId) },
        { $set: { "blocked.$[entry].profile_pic": profile_pic } },
        { arrayFilters: [{ "entry.id": String(userId) }] }
      )
    );
  }

  await Promise.all(arrayUpdates);
}

router.patch("/profile", authToken, async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.headers["x-auth-token"],
      process.env.ACCESS_TOKEN
    );

    const userId = decoded?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized", status: 401 });
    }

    const requestedUsername =
      req.body.username === undefined
        ? undefined
        : normalizeUsername(req.body.username);
    const requestedProfilePic =
      req.body.profile_pic === undefined ? undefined : req.body.profile_pic;

    if (
      requestedUsername !== undefined &&
      !isValidUsername(requestedUsername)
    ) {
      return res.status(400).json({
        message: "Username must be 2–32 characters.",
        status: 400,
      });
    }

    if (
      requestedProfilePic !== undefined &&
      !isValidProfilePicUrl(requestedProfilePic)
    ) {
      return res.status(400).json({
        message: "Profile picture must be a valid https URL (or empty).",
        status: 400,
      });
    }

    const $set = {};
    if (requestedUsername !== undefined) $set.username = requestedUsername;
    if (requestedProfilePic !== undefined) $set.profile_pic = requestedProfilePic;

    if (Object.keys($set).length === 0) {
      return res.status(400).json({ message: "No changes", status: 400 });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set },
      { returnDocument: "after" }
    );
    if (!updated) {
      return res.status(404).json({ message: "User not found", status: 404 });
    }
    await propagateUserIdentity({
      userId,
      username: $set.username,
      profile_pic: $set.profile_pic,
    });

    const token = jwt.sign(
      {
        id: String(updated._id),
        username: updated.username,
        tag: updated.tag,
        profile_pic: updated.profile_pic,
      },
      process.env.ACCESS_TOKEN
    );

    return res.status(200).json({
      status: 200,
      message: "Profile updated",
      token,
      user: {
        id: updated.id,
        username: updated.username,
        tag: updated.tag,
        profile_pic: updated.profile_pic,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", status: 500 });
  }
});

export default router;
