import { sendPasswordEmail } from "../utils/sendEmail.js";

import "../env.js";

export const sendNewPassword = async (
    email,
    name,
    newPassword
) => {
    await sendPasswordEmail({
        email,
        name,
        newPassword,
    });
};