// models/loginOtp.js

import mongoose from "mongoose";

const loginOtp = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    otp: {
        type: String,
        required: true
    },

    expiresAt: {
        type: Date,
        required: true
    },

    loginHistoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LoginHistory",
        required: true
    }
});

export default mongoose.model("LoginOtp", loginOtp);