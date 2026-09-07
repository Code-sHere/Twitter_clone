import bcrypt from "bcrypt";
import User from "../models/user.js";
import generatePassword from "../utils/passwordGeneration.js";


const forgetPassword = async (req, res) => {
    try {
        const { identifier } = req.body;

        // check vaid email or phone
        if (!identifier || identifier.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email or phone number is required"
            });
        }

        const value = identifier.trim();

        // find user using email or phone

        const user = await User.findOne({
            $or: [
                { email: value },
                { phone: value}
            ]
        })

        // chek user exisrt or not 
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }


        if (user.lastPassworResetRequest) {
            const lastRequest = new Date(user.lastPassworResetRequest);

            const now = new Date();

            const isSameDay =
                lastRequest.getFullYear() === now.getFullYear() &&
                lastRequest.getMonth() === now.getMonth() &&
                lastRequest.getDate() === now.getDate();

            if (isSameDay) {
                return res.status(400).json({
                    success: false,
                    message: "You can request password reset only once per day"
                });
            }
        }



        // generate password
        const newPassword = generatePassword(16);

        // hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        //update password 

        user.password = hashedPassword;

        user.lastPassworResetRequest = new Date();

        user.isTemporaryPassword = true;

        await user.save();

        return res.status(200).json({
            success: true,
            message:
                "Password reset successfully.",
        });

    } catch (error) {

        console.error(
            "Forgot Password Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong. Please try again later."
        });

    }
}

export default forgetPassword;