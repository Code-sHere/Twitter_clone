import mongoose from "mongoose";
import User from "../models/user.js";
import Followers from "../models/followers.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getCounts = async (userId) => {
    const [followersCount, followingCount] = await Promise.all([
        Followers.countDocuments({ followingId: userId }),
        Followers.countDocuments({ followerId: userId })
    ])

    return {
        followersCount,
        followingCount
    }
}

// post api/follow/:targetuserId body:{userID}

export const followUser = async (req, res) => {
    try {
        const { targetId } = req.params;
        const { userId } = req.body;

        if (!isValidId(userId || !isVlaidId(targetId))) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id"
            })
        }

        if (String(userId) === String(targetId)) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow yourself"
            })
        }

        const found = await User.countDocuments({ _id: { $in: [userId, targetId] } });

        if (found !== 2) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }
        try {
            await Followers.create({
                followerId: userId,
                followingId: targetId
            })
        } catch (error) {
            // 11000 = duplicate key error
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: "You are already following this user"
                })
            }
        }

        const count = await getCounts(targetId);
        return res.status(200).json({
            success: true,
            isFollowing: true,
            ...count
        });

    } catch (error) {
        console.log("Follow user error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// post api/unfollow/:targetuserId body:{userID}

export const unfollowUser = async (req, res) => {
    try {
        const { targetId } = req.params;
        const { userId } = req.body;

        if (!isValidId(userId) || !isValidId(targetId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id"
            })
        }

        await Followers.deleteOne({
            followerId: userId,
            followingId: targetId
        })

        const count = await getCounts(targetId);
        return res.status(200).json({
            success: true,
            isFollowing: false,
            ...count
        });

    } catch (error) {
        console.log("Unfollow user error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// get api/follow/:userId/stats?viewrId=...

export const getFollowStats = async (req, res) => {
    try {
        const { userId } = req.params;
        const { viewerId } = req.query;

        if (!isValidId(req.params.userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id"
            })
        }

        const counts = await getCounts(userId);
        let isFollowing = false;

        if (viewerId && isValidId(viewerId)) {
            isFollowing = !!(await Followers.exists({
                followerId: viewerId,
                followingId: userId
            }))
        }
        return res.status(200).json({
            success: true,
            isFollowing,
            ...counts,
        })
    } catch (error) {
        console.log("Get follow stats error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

// build both list endpoints

const buildList = (type) => async (req, res) => {
    try {
        const { userId } = req.params;
        const { viewerId } = req.query;

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);

        if (!isValidId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id"
            })
        }

        // followers: rows where followingId = userId
        // following: rows where followerId = userId

        const match = type === "followers" ? {
            followingId: userId
        } : {
            followerId: userId
        }

        const populateField = type === "followers" ? "followerId" : "followingId";

        const rows = await Followers.find(match)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate(populateField, "_id username displayName avatar bio");

        const users = rows.map((row) => row[populateField]).filter(Boolean);

        // which of these users does the viewer already follow?

        let followedSet = new Set();
        if (viewerId && isValidId(viewerId) && users.length > 0) {
            const mine = await Followers.find({
                followerId: viewerId,
                followingId: { $in: users.map((user) => user._id) },
            }).select("followingId");

            followedSet = new Set(mine.map((m) => m.followingId));
        }

        const result = users.map((user) => ({
            ...user.toObject(),
            isFollowing: followedSet.has(String(user._id)),
        }))

        const total = await Followers.countDocuments(match);

        return res.status(200).json({
            success: true,
            users: result,
            page,
            total,
            hasMore: page * limit < total,
        })

    } catch (error) {
        console.log("Build list error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

export const getFollowers = buildList("followers");
export const getFollowing = buildList("following");

// get User/:username

export const getUserByUsername = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select("._id username displayName avatar bio location website");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        return res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        console.log("Get user by username error", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}