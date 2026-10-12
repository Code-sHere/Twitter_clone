import express from "express";
import { followUser, unfollowUser, getFollowStats, getFollowers, getFollowing, getSuggestions, searchUsers } from "../Controllers/followerController.js";

const router = express.Router();

router.get("/suggestions", getSuggestions);
router.get("/search", searchUsers);

router.post("/:targetId", followUser);
router.post("/:targetId/unfollow", unfollowUser);

router.get("/:userId/stats", getFollowStats);
router.get("/:userId/followers", getFollowers);
router.get("/:userId/following", getFollowing);

export default router;