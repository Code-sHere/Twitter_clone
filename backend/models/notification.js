import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        tweetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tweet",
            required: true
        },

        type: {
            type: String,
            enum: ["keyword"],
            default: "keyword"
        },

        message: {
            type: String,
            required: true
        },

        keyword: {
            type: String,
            required: true
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model(
    "Notification",
    NotificationSchema
);