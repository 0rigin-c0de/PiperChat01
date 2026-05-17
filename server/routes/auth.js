import crypto from "crypto";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { buildAuthUserJwtPayload } from "../lib/authJwtPayload.js";
import { OTP_TTL_MS } from "../config/constants.js";
import { authToken } from "../middleware/auth.js";
import User from "../models/User.js";
import { generateOTP, sendMail } from "../services/email.js";
import {
  isUsernameAvailable,
  signup,
  updatingCreds,
} from "../services/userService.js";

const router = express.Router();

function sendVerificationEmailAsync(otp, email, username, context = "signup") {
  sendMail(otp, email, username)
    .then((mailResult) => {
      if (!mailResult.ok) {
        console.warn(`[auth/${context}] Verification email not sent:`, {
          email,
          reason: mailResult.reason,
          provider: mailResult.provider,
          error: mailResult.error?.message,
        });
      }
    })
    .catch((err) => {
      console.error(`[auth/${context}] sendMail error:`, err?.message || err);
    });
}

function signupJson(res, status, payload) {
  return res.status(status).json({ ok: status >= 200 && status < 300, ...payload });
}

function looksLikeBcryptHash(storedPassword) {
  return (
    typeof storedPassword === "string" &&
    /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(storedPassword)
  );
}

function constantTimeStringEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

async function verifyStoredPassword(plainPassword, storedPassword) {
  if (looksLikeBcryptHash(storedPassword)) {
    try {
      return await bcrypt.compare(plainPassword, storedPassword);
    } catch {
      return false;
    }
  }
  return constantTimeStringEqual(plainPassword, storedPassword);
}

router.post("/verify_route", authToken, (req, res) => {
  res.status(201).json({ message: "authorized", status: 201 });
});

router.post("/signup", async (req, res) => {
  const startedAt = Date.now();
  const reqId = Math.random().toString(36).slice(2, 10);
  console.log(`[auth/signup][${reqId}] → received request`);
  try {
    const { email, username, password, dob } = req.body ?? {};
    const authorized = false;

    const response = await signup(email, username, password, dob);

    if (
      response.status === 204 ||
      response.status === 400 ||
      response.status === 202
    ) {
      return signupJson(res, response.status, {
        message: response.message,
        status: response.status,
      });
    }

    if (typeof password !== "string" || password.length === 0) {
      return signupJson(res, 204, { message: "wrong input", status: 204 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (response.message === true) {
      const otp = generateOTP();
      const usernameResponse = await isUsernameAvailable(username);
      const finalTag = usernameResponse.final_tag;

      const newUser = new User({
        username,
        tag: finalTag,
        profile_pic: process.env.default_profile_pic,
        email,
        password: hashedPassword,
        dob,
        authorized,
        verification: [{ timestamp: Date.now(), code: otp }],
      });

      try {
        await newUser.save();
        console.log(`[auth/signup][${reqId}] user saved successfully`);
      } catch (err) {
        console.error("[auth/signup] Failed to save user:", err?.message || err);
        return signupJson(res, 500, {
          message: "Server error",
          status: 500,
          email_sent: false,
        });
      }

      console.log(`[auth/signup][${reqId}] starting background email send`);
      sendVerificationEmailAsync(otp, email, username, "signup");

      return signupJson(res, 201, {
        message: "data saved",
        status: 201,
        email_sent: null,
      });
    }

    if (response.message === "not_TLE" || response.message === "TLE_2") {
      const usernameResponse = await isUsernameAvailable(username);
      const tag = usernameResponse.final_tag;
      const accountCreds = {
        $set: {
          username,
          tag,
          email,
          password: hashedPassword,
          dob,
          authorized,
        },
      };
      const otp =
        response.message === "not_TLE" ? response.otp : generateOTP();
      const newResponse = await updatingCreds(
        accountCreds,
        otp,
        email,
        username
      );
      return signupJson(res, newResponse.status, {
        message: newResponse.message,
        status: newResponse.status,
        email_sent: null,
      });
    }

    if (response.message === "not_TLE_2" || response.message === "TLE") {
      const tag = response.tag;
      let accountCreds;
      let otp;

      if (response.message === "not_TLE_2") {
        accountCreds = {
          $set: {
            username,
            tag,
            email,
            password: hashedPassword,
            dob,
            authorized,
          },
        };
        otp = response.otp;
      } else {
        otp = generateOTP();
        accountCreds = {
          $set: {
            username,
            email,
            tag,
            password: hashedPassword,
            dob,
            authorized,
            verification: [{ timestamp: Date.now(), code: otp }],
          },
        };
      }

      const newResponse = await updatingCreds(
        accountCreds,
        otp,
        email,
        username
      );
      return signupJson(res, newResponse.status, {
        message: newResponse.message,
        status: newResponse.status,
        email_sent: null,
      });
    }

    console.warn("[auth/signup] Unhandled signup branch:", response);
    return signupJson(res, 500, {
      message: "Server error",
      status: 500,
      email_sent: false,
    });
  } catch (err) {
    console.error("[auth/signup] Unhandled error:", err?.message || err);
    if (!res.headersSent) {
      return signupJson(res, 500, {
        message: "Server error",
        status: 500,
        email_sent: false,
      });
    }
  } finally {
    console.info(`[auth/signup][${reqId}] completed in ${Date.now() - startedAt}ms`);
  }
});

router.post("/verify", async (req, res) => {
  const { email } = req.body;
  const otpValue = String(req.body.otp_value || "").trim();

  try {
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found", status: 404 });
    }

    const currentTimestamp = user.verification?.[0]?.timestamp ?? 0;
    const username = user.username;
    const currentOtp = user.verification?.[0]?.code;

    if (Date.now() - currentTimestamp < OTP_TTL_MS) {
      if (otpValue === currentOtp) {
        await User.updateOne({ email }, { $set: { authorized: true } });
        return res.status(201).json({
          message: "Congrats you are verified now",
          status: 201,
        });
      }
      return res.status(432).json({ error: "incorrect passowrd", status: 432 });
    }

    const otp = generateOTP();
    await User.updateOne(
      { email },
      {
        $set: {
          verification: [{ timestamp: Date.now(), code: otp }],
        },
      }
    );
    sendVerificationEmailAsync(otp, email, username, "verify");
    return res.status(442).json({ error: "otp changed", status: 442 });
  } catch (err) {
    return res.status(500).json({ error: "Server error", status: 500 });
  }
});

router.post("/resend_otp", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found", status: 404 });
    }
    if (user.authorized === true) {
      return res.status(409).json({ error: "Already verified", status: 409 });
    }

    const username = user.username;
    const otp = generateOTP();
    await User.updateOne(
      { email },
      { $set: { verification: [{ timestamp: Date.now(), code: otp }] } }
    );
    sendVerificationEmailAsync(otp, email, username, "resend_otp");
    return res.status(201).json({
      message: "otp resent",
      status: 201,
      email_sent: null,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error", status: 500 });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const email = req.body.email;
    const plainPassword = req.body.password;
    if (
      typeof email !== "string" ||
      email.length === 0 ||
      typeof plainPassword !== "string" ||
      plainPassword.length === 0
    ) {
      return res
        .status(442)
        .json({ error: "invalid username or password", status: 442 });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res
        .status(442)
        .json({ error: "invalid username or password", status: 442 });
    }

    const validPassword = await verifyStoredPassword(
      plainPassword,
      user.password
    );

    if (!validPassword) {
      return res
        .status(442)
        .json({ error: "invalid username or password", status: 442 });
    }

    if (user.authorized !== true) {
      return res
        .status(422)
        .json({ error: "you are not verified yet", status: 422 });
    }

    if (!looksLikeBcryptHash(user.password)) {
      const newHash = await bcrypt.hash(plainPassword, 10);
      await User.updateOne({ _id: user._id }, { $set: { password: newHash } });
    }

    const token = jwt.sign(
      buildAuthUserJwtPayload(user),
      process.env.ACCESS_TOKEN
    );
    return res
      .status(201)
      .json({ message: "you are verified", status: 201, token });
  } catch (err) {
    return res.status(500).json({ error: "Server error", status: 500 });
  }
});

export default router;
