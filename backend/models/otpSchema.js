// models/loginOtp.js

import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    otp: {
        type: String,
        required: true
    },

    purpose: {
        type: String,
        enum: ["login", "audioTweet"],
        default: "login"
    },

    expiresAt: {
        type: Date,
        required: true
    },

    verified: {
        type: Boolean,
        default: false
    },
    
    loginHistoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LoginHistory",
    }
});

export default mongoose.model("OTP", otpSchema);