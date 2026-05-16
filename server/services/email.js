import nodemailer from "nodemailer";
import { Resend } from "resend";

const emailUser = process.env.EMAIL_USER || process.env.MAIL_USER;
const DEFAULT_RESEND_FROM = "PiperChat <onboarding@resend.dev>";
const RESEND_SEND_TIMEOUT_MS = Number(
  process.env.RESEND_SEND_TIMEOUT_MS || 10_000
);

/** @typedef {"console" | "resend" | "smtp" | "gmail" | "gmail-oauth"} EmailProvider */

let resendClient;

function isConsoleTransport() {
  return process.env.MAIL_TRANSPORT === "console";
}

function hasResendConfig() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function hasSmtpConfig() {
  const smtpUser = process.env.SMTP_USER || emailUser;
  const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASS;
  return Boolean(process.env.SMTP_HOST && smtpUser && smtpPass);
}

function hasGmailPasswordConfig() {
  return Boolean(emailUser && process.env.MAIL_PASS);
}

function hasGmailOAuthConfig() {
  return Boolean(
    emailUser &&
      process.env.OAUTH_CLIENTID &&
      process.env.OAUTH_CLIENT_SECRET &&
      process.env.OAUTH_REFRESH_TOKEN
  );
}

/**
 * Provider priority: console → Resend → SMTP → Gmail password → Gmail OAuth.
 * @returns {EmailProvider | null}
 */
function resolveEmailProvider() {
  if (isConsoleTransport()) {
    return "console";
  }
  if (hasResendConfig()) {
    return "resend";
  }
  if (hasSmtpConfig()) {
    return "smtp";
  }
  if (hasGmailPasswordConfig()) {
    return "gmail";
  }
  if (hasGmailOAuthConfig()) {
    return "gmail-oauth";
  }
  return null;
}

function getResendClient() {
  if (!resendClient && hasResendConfig()) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

function getFromAddress() {
  const configured =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    process.env.MAIL_FROM?.trim() ||
    emailUser;

  if (!configured) {
    return DEFAULT_RESEND_FROM;
  }

  if (configured.includes("<") || configured.includes("@")) {
    return configured.includes("<")
      ? configured
      : `PiperChat <${configured}>`;
  }

  return DEFAULT_RESEND_FROM;
}

function withTimeout(promise, timeoutMs, label) {
  let settled = false;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(error);
      });
  });
}

function normalizeResendError(error) {
  if (!error) {
    return { message: "Unknown Resend error" };
  }

  if (typeof error === "string") {
    return { message: error };
  }

  const nested = error.error ?? error;
  return {
    message:
      nested.message ||
      error.message ||
      "Resend request failed",
    name: nested.name || error.name,
    statusCode: nested.statusCode ?? error.statusCode ?? null,
  };
}

function buildVerificationMailContent(otp, recipientEmail, nameValue) {
  const subject = "Email for Verification";
  const text = `Hello ${nameValue}
    You registered an account on PiperChat, Here is your otp for verification - ${otp}
    Kind Regards, Sunil Kumar`;

  return { subject, text, to: recipientEmail };
}

function createSmtpTransporter() {
  const smtpPort = process.env.SMTP_PORT
    ? Number(process.env.SMTP_PORT)
    : undefined;
  const smtpUser = process.env.SMTP_USER || emailUser;
  const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASS;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort || 587,
    secure: Boolean(process.env.SMTP_SECURE) || smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });
}

function createGmailPasswordTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: emailUser, pass: process.env.MAIL_PASS },
  });
}

function createGmailOAuthTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: emailUser,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
  });
}

/**
 * @param {Exclude<EmailProvider, "console" | "resend">} provider
 */
function createNodemailerTransporter(provider) {
  switch (provider) {
    case "smtp":
      return createSmtpTransporter();
    case "gmail":
      return createGmailPasswordTransporter();
    case "gmail-oauth":
      return createGmailOAuthTransporter();
    default:
      return null;
  }
}

function logResendError(error) {
  console.error("[email][resend] Delivery failed:", {
    message: error?.message,
    name: error?.name,
    statusCode: error?.statusCode,
  });
}

function logNodemailerError(provider, error) {
  console.error(`[email][${provider}] Delivery failed:`, error?.message || error);
}

async function sendViaConsole(content) {
  console.info("[email][console] Verification email (not sent):", {
    to: content.to,
    subject: content.subject,
    body: content.text,
  });
  return { ok: true, provider: "console" };
}

async function sendViaResend(content) {
  const client = getResendClient();
  if (!client) {
    return { ok: false, reason: "mail_not_configured", provider: "resend" };
  }

  const from = getFromAddress();

  try {
    const { data, error } = await withTimeout(
      client.emails.send({
        from,
        to: [content.to],
        subject: content.subject,
        text: content.text,
      }),
      RESEND_SEND_TIMEOUT_MS,
      "Resend send"
    );

    if (error) {
      const normalized = normalizeResendError(error);
      logResendError(normalized);
      return {
        ok: false,
        reason: "send_failed",
        provider: "resend",
        error: normalized,
      };
    }

    return { ok: true, provider: "resend", info: data };
  } catch (error) {
    const normalized = normalizeResendError(error);
    logResendError(normalized);
    return {
      ok: false,
      reason: "send_failed",
      provider: "resend",
      error: normalized,
    };
  }
}

async function sendViaNodemailer(content, provider) {
  const transporter = createNodemailerTransporter(provider);
  if (!transporter) {
    return { ok: false, reason: "mail_not_configured", provider };
  }

  const mailOptions = {
    from: emailUser || getFromAddress(),
    to: content.to,
    subject: content.subject,
    text: content.text,
  };

  try {
    const info = await withTimeout(
      transporter.sendMail(mailOptions),
      RESEND_SEND_TIMEOUT_MS,
      `${provider} send`
    );
    return { ok: true, provider, info };
  } catch (error) {
    logNodemailerError(provider, error);
    return {
      ok: false,
      reason: "send_failed",
      provider,
      error: { message: error?.message || String(error) },
    };
  }
}

async function sendMail(otp, mailValue, nameValue) {
  const provider = resolveEmailProvider();
  const content = buildVerificationMailContent(otp, mailValue, nameValue);

  if (!provider) {
    console.warn(
      "[email] Mail not configured; unable to send verification email."
    );
    return { ok: false, reason: "mail_not_configured" };
  }

  switch (provider) {
    case "console":
      return sendViaConsole(content);
    case "resend":
      return sendViaResend(content);
    case "smtp":
    case "gmail":
    case "gmail-oauth":
      return sendViaNodemailer(content, provider);
    default:
      return { ok: false, reason: "mail_not_configured" };
  }
}

function generateOTP() {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 4; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export { sendMail, generateOTP };
