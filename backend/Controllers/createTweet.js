import Tweet from "../models/tweet.js"
import Subscription from "../models/Subscription.js"
import User from "../models/user.js"

export const createTweet = async (req, res) => {
    try {
        const { author, content, image } = req.body;

        if (!author || !content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Author and content are required."
            });
        }

        const subscription = await Subscription.findOne({
            UserId: author,
            status: "active"
        });

        if (!subscription) {
            return res.status(400).json({
                success: false,
                message: "No active subscription found."
            });
        }

        // Get start of today (midnight)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Reset counter if last reset was before today
        if (!subscription.lastResetDate || subscription.lastResetDate < startOfToday) {
            console.log(
                `Resetting tweetUsed for ${subscription.UserId} — last reset was ${subscription.lastResetDate}`
            );
            subscription.tweetUsed = 0;
            subscription.lastResetDate = startOfToday;
            await subscription.save();
        }

        // Check daily limit (gold = unlimited)
        if (subscription.plan !== "gold" && subscription.tweetUsed >= subscription.tweetLimit) {
            return res.status(403).json({
                success: false,
                message: `Daily tweet limit reached. You can post only ${subscription.tweetLimit} tweets per day.`,
            });
        }

        const tweet = new Tweet({
            author: subscription.UserId,
            content: content.trim(),
            image: image || null,
        });

        await tweet.save();

        if (subscription.plan !== "gold") {
            subscription.tweetUsed += 1;
            await subscription.save();
        }

        return res.status(201).json({
            success: true,
            message: "Tweet posted successfully",
            tweet,
            tweetUsed: subscription.plan === "gold" ? null : subscription.tweetUsed,
            tweetLimit: subscription.plan === "gold" ? null : subscription.tweetLimit,
            tweetsRemaining:
                subscription.plan === "gold"
                    ? "Unlimited"
                    : subscription.tweetLimit - subscription.tweetUsed,
        });

    } catch (error) {
        console.error("Create Tweet Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create tweet",
            error: error.message,
        });
    }
}