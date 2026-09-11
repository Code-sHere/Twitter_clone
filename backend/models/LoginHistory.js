import mongoose from "mongoose";

const LoginDetailsSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", required: true
    },
    name:{
        type: String, required: true
    },
    browser: {
        type: String, required: true
    },
    operatingSystem: {
        type: String, required: true
    },
    deviceType: {
        type: String, required: true
    },
    ipAddress: {
        type: String, required: true
    },
    loginTime: {
        type: Date, required: true
    },
    status:{
        type: String,
        enum: ["success", "failed"],
        required: true
    }
});

export default mongoose.model("LoginDetail", LoginDetailsSchema);