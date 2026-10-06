import mongoose from "mongoose";

const FollowersSchema = mongoose.Schema({
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    followingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now(),
    },
})

//  a user can follow another user only once
FollowersSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// fast "who follows me " lookups
FollowersSchema.index({ followingId: 1 , createdAt: -1});

export default mongoose.model("Followers", FollowersSchema);
