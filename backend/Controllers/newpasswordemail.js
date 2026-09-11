import nodemailer from "nodemailer";
import "../env.js";
import User from "../models/user.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    }
})

export const sendPasswordEmail = async ({
  email,
  name,
  newPassword
}) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `New Password - ${name}`,
    html: `
      <h2>New Password Generated</h2>

      <p>Hello ${name},</p>

      <p>Your new password is: <strong>${newPassword}</strong></p>

      <p>Please change your password after logging in.</p>
    `,
  });

  console.log("Email sent successfully");
};