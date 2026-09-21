import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    displayName: { type: String, required: true },
    avatar: { type: String, default: "" },
    email: {
        type: String, required: true, unique: true, lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    website: { type: String, default: "" },
    password: { type: String, required: true },
    lastPasswordResetRequest: { type: Date, default: null },
    notificationEnabled : {
        type: Boolean,
        default: true
    },
    isTemporaryPassword: {
        type: Boolean,
        default: false
    }
})


export default mongoose.model("User", UserSchema);
