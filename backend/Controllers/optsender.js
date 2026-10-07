import { Resend } from "resend";
import "../env.js";

const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);

export const sendOtp = async (email, name, otp) => {
    try {
        const { data, error } = await resend.emails.send({
            from: "Twiller <onboarding@resend.dev>",
            to: [email],
            subject: "Your Twiller Verification Code",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2>Twiller Verification</h2>

                    <p>Hello ${name || "User"},</p>

                    <p>Your verification code is:</p>

                    <h1 style="letter-spacing: 8px;">
                        ${otp}
                    </h1>

                    <p>This OTP expires in 5 minutes.</p>

                    <p>Do not share this code with anyone.</p>

                    <p>Regards,<br/>Twiller Team</p>
                </div>
            `
        });

        if (error) {
            console.error("Resend email error:", error);
            throw new Error(error.message);
        }

        console.log("Email sent successfully:", data.id);

        return data;

    } catch (error) {
        console.error("Email sending error:", error);
        throw error;
    }
};