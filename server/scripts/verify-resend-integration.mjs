/**
 * Local Resend integration verification (Issue #44).
 * Run from repo: node server/scripts/verify-resend-integration.mjs
 */
import { spawn } from "child_process";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SANDBOX_EMAIL = "amritasahu490@gmail.com";
const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? `: ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.error(`✗ ${name}${detail ? `: ${detail}` : ""}`);
}

function runChild(scriptLines) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["--input-type=module", "-e", scriptLines],
      {
        cwd: path.join(__dirname, ".."),
        env: process.env,
        stdio: ["ignore", "pipe", "pipe"],
      }
    );
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => {
      resolve({ code, out: out.trim(), err: err.trim() });
    });
    child.on("error", reject);
  });
}

async function testImportsAndProvider() {
  if (process.env.MAIL_TRANSPORT === "console") {
    fail("MAIL_TRANSPORT", "MAIL_TRANSPORT=console is set — disable for Resend test");
    return;
  }
  pass("MAIL_TRANSPORT", "not console");

  if (!process.env.RESEND_API_KEY?.trim()) {
    fail("RESEND_API_KEY", "missing");
    return;
  }
  pass("RESEND_API_KEY", "configured");

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "PiperChat <onboarding@resend.dev>";
  pass("RESEND_FROM_EMAIL", from);

  await import("resend");
  pass("resend package import");

  const { sendMail } = await import("../services/email.js");
  const result = await sendMail("8888", SANDBOX_EMAIL, "ResendVerify");

  if (result.provider !== "resend") {
    fail("provider resolution", `expected resend, got ${result.provider}`);
    return;
  }
  pass("provider resolution", "resend");

  if (!result.ok) {
    fail("Resend API send", result.error?.message || "unknown");
    return;
  }
  pass("Resend API send", `email id ${result.info?.id}`);
}

async function testSignupAndAuth() {
  const { connect } = await import("../config/db.js");
  const authRoutes = (await import("../routes/auth.js")).default;
  const User = (await import("../models/User.js")).default;

  await connect();

  const username = `resend_${Date.now().toString().slice(-6)}`;
  const password = "ResendTest99";

  await User.deleteOne({ email: SANDBOX_EMAIL });

  const app = express();
  app.use(express.json());
  app.use("/", authRoutes);

  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;

  try {
    const t0 = Date.now();
    const signupRes = await fetch(`${base}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: SANDBOX_EMAIL,
        username,
        password,
        dob: "January 1 , 2000",
      }),
    });
    const signupBody = await signupRes.json();
    const signupMs = Date.now() - t0;

    if (signupRes.status !== 201) {
      fail("signup", `${signupRes.status} ${JSON.stringify(signupBody)}`);
      return;
    }
    pass("signup", `201 in ${signupMs}ms (email async)`);

    await new Promise((r) => setTimeout(r, 5000));

    const user = await User.findOne({ email: SANDBOX_EMAIL }).lean();
    const otp = user?.verification?.[0]?.code;
    if (!otp || otp.length !== 4) {
      fail("OTP generation", "missing verification code in DB");
      return;
    }
    pass("OTP generation", `code saved (check inbox for OTP)`);

    const verifyRes = await fetch(`${base}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: SANDBOX_EMAIL, otp_value: otp }),
    });
    const verifyBody = await verifyRes.json();
    if (verifyRes.status !== 201) {
      fail("verify", `${verifyRes.status} ${JSON.stringify(verifyBody)}`);
    } else {
      pass("verify", "account authorized");
    }

    const signinRes = await fetch(`${base}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: SANDBOX_EMAIL, password }),
    });
    const signinBody = await signinRes.json();
    if (signinRes.status === 201 && signinBody.token) {
      pass("signin", "JWT issued");
    } else {
      fail("signin", `${signinRes.status} ${JSON.stringify(signinBody)}`);
    }

    await User.updateOne(
      { email: SANDBOX_EMAIL },
      { $set: { authorized: false } }
    );

    const resendRes = await fetch(`${base}/resend_otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: SANDBOX_EMAIL }),
    });
    if (resendRes.status === 201) {
      pass("resend_otp", "201 — check inbox for new OTP");
    } else {
      fail("resend_otp", `${resendRes.status}`);
    }
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

async function testConsoleFallback() {
  const { code, out, err } = await runChild(`
    import './config/env.js';
    process.env.MAIL_TRANSPORT = 'console';
    delete process.env.RESEND_API_KEY;
    const { sendMail } = await import('./services/email.js');
    const r = await sendMail('1111', '${SANDBOX_EMAIL}', 't');
    console.log(JSON.stringify(r));
  `);
  if (code !== 0) {
    fail("console transport (child)", err || out);
    return;
  }
  const result = JSON.parse(out.split("\n").pop());
  if (result.provider === "console" && result.ok) {
    pass("console transport (child)", "console provider");
  } else {
    fail("console transport (child)", out);
  }
}

async function testGmailFallbackWithoutResend() {
  const { code, out, err } = await runChild(`
    import './config/env.js';
    delete process.env.MAIL_TRANSPORT;
    delete process.env.RESEND_API_KEY;
    const { sendMail } = await import('./services/email.js');
    const r = await sendMail('2222', 'other@example.com', 't');
    console.log(JSON.stringify(r));
  `);
  if (code !== 0) {
    fail("Gmail fallback (child)", err || out);
    return;
  }
  const result = JSON.parse(out.split("\n").pop());
  if (result.provider === "gmail" || result.reason === "send_failed") {
    pass(
      "Gmail fallback (child)",
      `Resend skipped; nodemailer used (${result.provider || result.reason})`
    );
  } else if (result.reason === "mail_not_configured") {
    pass("Gmail fallback (child)", "mail_not_configured");
  } else {
    fail("Gmail fallback (child)", out);
  }
}

async function main() {
  console.log("=== PiperChat Resend integration verification ===\n");
  console.log(`Sandbox recipient: ${SANDBOX_EMAIL}`);
  console.log(
    "Manual checks: inbox/spam + https://resend.com/emails for delivery status\n"
  );

  await testImportsAndProvider();
  await testSignupAndAuth();
  await testConsoleFallback();
  await testGmailFallbackWithoutResend();

  const failed = results.filter((r) => !r.ok);
  console.log(
    `\n=== ${results.length - failed.length}/${results.length} automated checks passed ===`
  );

  if (failed.length) {
    console.log("\nFailed:");
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }

  console.log(
    "\nIssue #44 core objective: Resend is active provider; direct send + auth flows OK."
  );
  console.log("Confirm delivery in Resend dashboard and amritasahu490@gmail.com inbox.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
