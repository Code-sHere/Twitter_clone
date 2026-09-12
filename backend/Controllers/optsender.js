import nodemailer from "nodemailer";
import "../env.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    }
})

export const sendOtp = async (email,name,otp) =>{

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verification Code",
        html: `
        <h1>Dear User : ${name}</>
        <h2>The Security Check Code</h2>
        <h2>Here is Your one time password for cheking: ${otp}</h2>
        <p>Do not share this code with anyone</p>
        `
    });

    console.log("otp sent successfully", otp);
}