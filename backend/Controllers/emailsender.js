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

export const sendPaymentEmail = async ({
  email,
  name,
  planName,
  amount,
  paymentId,
  subscriptionId,
}) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Payment Successful - ${planName} Plan`,
    html: `
      <h2>Payment Successful 🎉</h2>

      <p>Hello ${name},</p>

      <p>Your subscription payment was successful.</p>

      <h3>Payment Details</h3>

      <p><strong>Plan:</strong> ${planName}</p>
      <p><strong>Amount:</strong> ₹${amount}</p>
      <p><strong>Payment ID:</strong> ${paymentId}</p>
      <p><strong>Subscription ID:</strong> ${subscriptionId}</p>
      <p><strong>Status:</strong> Successful</p>

      <br/>

      <p>Thank you for subscribing!</p>
    `,
  });
};