import {sendEmail, otpEmail} from "../utils/sendEmail.js";
import "../env.js";

export const sendOtp = async (email, otp) => {
    const {subject , html} = otpEmail(otp);
    await sendEmail(email, subject, html);
};