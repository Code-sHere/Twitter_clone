import express from 'express';
import Tweet from '../models/tweet.js';
import User from '../models/user.js';
import mongoose from 'mongoose';

const router = express.Router();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const AUTHOR_FIELDS = "displayName username avatar";

// Trending hashtags (last 24hours)
router.get("/trending-tags", async (req, res) => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tags = await Tweet.aggregate([
        { $match: { createdAt: { $gte: since }, hashtags: { $ne: [] } } },
        { $unwind: "$hashtags" },
        { $group: { _id: "$hashtags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
    ])
    res.json(tags.map((t) => ({ tag: t._id, count: t.count })));
});

router.get("/tweets", async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 20;
    const skip = (page - 1) * limit;

    if (req.query.tab === "latest") {
        const tweets = await Tweet.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate("author", AUTHOR_FIELDS);
        res.json(tweets);
    }

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const tweets = await Tweet.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
            $addFields: {
                score: {
                    $add: [
                        { $size: { $ifNull: ["$likes", []] } },
                        { $multiply: [2, { $size: { $ifNull: ["$comments", []] } }] },
                    ],
                },
            },
        },
        { $sort: { score: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
    ]);

    await Tweet.populate(tweets, { path: "author", select: AUTHOR_FIELDS });
    res.json(tweets);
})

router.get("/search", async (req, res) => {
    try {
        const q = (req.query.q || "").trim();
        if (!q) return res.json({ users: [], tweets: [] });
        const rx = new RegExp(escapeRegex(q), "i");

        const [users, tweets] = await Promise.all([
            User.find({ $or: [{ displayName: rx }, { username: rx }] }).select(AUTHOR_FIELDS).limit(10),
            Tweet.find({ content: rx }).sort({ createdAt: -1 }).limit(20).populate("author", AUTHOR_FIELDS),
        ]);
        res.json({ users, tweets });
    } catch (err) {
        console.error("search error:", err);
        res.status(500).json({ message: "Search failed" });
    }
});

router.get("/tweet/:id", async(req, res) =>{
    try{
        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).send({ error: "Invalid tweet id" });
        }
        const tweet = await Tweet.findById(req.params.id).populate("author", AUTHOR_FIELDS);
        if(!tweet){
            return res.status(404).send({ error: "Tweet not found" });
        }
        res.json(tweet);
    }catch(error){
        return res.status(400).send({ error: error.message });
    }
})

export default router;