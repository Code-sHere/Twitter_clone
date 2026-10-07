import { Resend } from "resend";
import "../env.js";

const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);

export const sendPasswordEmail = async ({
    email,
    name,
    newPassword
}) => {
    try {
        const { data, error } = await resend.emails.send({
            from: "Twiller <onboarding@resend.dev>",
            to: [email],
            subject: `New Password - ${name}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>New Password Generated</title>
                </head>

                <body style="
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                    padding: 30px;
                ">

                    <div style="
                        max-width: 600px;
                        margin: auto;
                        background: white;
                        padding: 30px;
                        border-radius: 10px;
                    ">

                        <h2>New Password Generated 🔐</h2>

                        <p>Hello ${name},</p>

                        <p>
                            Your new password has been generated successfully.
                        </p>

                        <p>
                            Your new password is:
                        </p>

                        <div style="
                            background: #f1f1f1;
                            padding: 15px;
                            border-radius: 6px;
                            font-size: 18px;
                            font-weight: bold;
                            letter-spacing: 1px;
                        ">
                            ${newPassword}
                        </div>

                        <p>
                            Please log in using this password and change it
                            immediately from your profile/settings.
                        </p>

                        <p>
                            If you did not request a password reset, please
                            contact the Twiller team.
                        </p>

                        <br>

                        <p>
                            Regards,<br>
                            <strong>Twiller Team</strong>
                        </p>

                    </div>

                </body>
                </html>
            `,
        });

        if (error) {
            console.error("Password email error:", error);
            throw new Error(error.message);
        }

        console.log("Password email sent successfully:", data.id);

        return data;

    } catch (error) {
        console.error(
            "Password email sending failed:",
            error.message
        );

        throw error;
    }
};