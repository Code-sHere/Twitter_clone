import bcrypt from "bcrypt";
import User from "../models/user.js";
import generatePassword from "../utils/passwordGeneration.js";
import { sendPasswordEmail } from "../utils/sendEmail.js";


const forgetPassword = async (req, res) => {
  try {
    const { identifier } = req.body;

    // Validate email or phone number
    if (
      typeof identifier !== "string" ||
      !identifier.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is required.",
      });
    }

    const value = identifier.trim();

    // Find user using email or phone
    const user = await User.findOne({
      $or: [
        { email: value },
        { phone: value },
      ],
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });
    }

    // Allow only one password reset request per calendar day
    if (user.lastPasswordResetRequest) {
      const lastRequest = new Date(
        user.lastPasswordResetRequest
      );

      const now = new Date();

      const isSameDay =
        lastRequest.getFullYear() === now.getFullYear() &&
        lastRequest.getMonth() === now.getMonth() &&
        lastRequest.getDate() === now.getDate();

      if (isSameDay) {
        return res.status(429).json({
          success: false,
          message:
            "You can request a password reset only once per day.",
        });
      }
    }

    // Generate a temporary password
    const newPassword = generatePassword(16);

    // Hash the temporary password
    const salt = await bcrypt.genSalt(12);

    const hashedPassword = await bcrypt.hash(
      newPassword,
      salt
    );

    // Save previous values for rollback if email fails
    const previousPassword = user.password;
    const previousResetRequest =
      user.lastPasswordResetRequest;
    const previousTemporaryStatus =
      user.isTemporaryPassword;

    // Update password
    user.password = hashedPassword;
    user.lastPasswordResetRequest = new Date();
    user.isTemporaryPassword = true;

    await user.save();

    // Send temporary password through Brevo
    try {
      await sendPasswordEmail({
        email: user.email,
        name: user.name,
        newPassword,
      });
    } catch (emailError) {
      // Restore previous values if email delivery fails
      user.password = previousPassword;
      user.lastPasswordResetRequest =
        previousResetRequest;
      user.isTemporaryPassword =
        previousTemporaryStatus;

      await user.save();

      throw emailError;
    }

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", {
      message: error.message,
      code: error.code,
      status: error.status,
    });

    return res.status(500).json({
      success: false,
      message:
        "Unable to reset your password right now. Please try again later.",
    });
  }
};

export default forgetPassword;