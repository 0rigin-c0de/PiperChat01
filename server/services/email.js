import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER || process.env.MAIL_USER;

function createTransporter() {
  if (process.env.MAIL_TRANSPORT === "console") {
    return null;
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT
    ? Number(process.env.SMTP_PORT)
    : undefined;
  const smtpUser = process.env.SMTP_USER || emailUser;
  const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort || 587,
      secure: Boolean(process.env.SMTP_SECURE) || (smtpPort === 465),
      auth: { user: smtpUser, pass: smtpPass },
    });
  }

  if (emailUser && process.env.MAIL_PASS) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user: emailUser, pass: process.env.MAIL_PASS },
    });
  }

  if (
    emailUser &&
    process.env.OAUTH_CLIENTID &&
    process.env.OAUTH_CLIENT_SECRET &&
    process.env.OAUTH_REFRESH_TOKEN
  ) {
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

  return null;
}

async function sendMail(otp, mailValue, nameValue) {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn("[email] Mail not configured; unable to send verification email.");
    return { ok: false, reason: "mail_not_configured" };
  }

  const mailOptions = {
    from: emailUser,
    to: mailValue,
    subject: "Email for Verification",
    text: `Hello ${nameValue}
    You registered an account on PiperChat, Here is your otp for verification - ${otp}
    Kind Regards, Sunil Kumar`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { ok: true, info };
  } catch (error) {
    console.error("Error sending email:", error);
    return { ok: false, reason: "send_failed" };
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
