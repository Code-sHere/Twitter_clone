import Tweet from "../models/tweet.js"
import Subscription from "../models/Subscription.js"
import assets from "../models/assets.js"
import User from "../models/user.js";
import Notification from "../models/notification.js";

export const createTweet = async (req, res) => {
    try {
        const { author, content, image, audio } = req.body;

        console.log("re.body", req.body);

        if (!author) {
            return res.status(400).json({
                success: false,
                message: "Author and content are required."
            });
        }

        const cleanContent =
            typeof content === "string"
                ? content.trim()
                : "";

        const cleanImage =
            typeof image === "string" &&
                image.trim().length > 0
                ? image.trim()
                : null;

        const cleanAudio =
            typeof audio === "string" &&
                audio.trim().length > 0
                ? audio.trim()
                : null;


        if (!cleanContent && !cleanImage && !cleanAudio) {
            return res.status(400).json({
                success: false,
                message: "Tweet must contain text, image or audio."
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

        // save tweet
        const tweet = new Tweet({
            author: subscription.UserId,
            content: content?.trim(),
        });

        await tweet.save();
        console.log("TWEET:", tweet._id);

        if(cleanContent){
            const keywords = ["cricket", "science"];

            const lowerContent = cleanContent.toLowerCase();

            const matchedKeyword = keywords.find(keyword => lowerContent.includes(keyword));

            if(matchedKeyword){
                console.log("KEYWORD MATCHED", matchedKeyword);

                // find users who enables notifications 
                const users = await User.find({
                    notificationEnabled: true
                }).select("_id");

                console.log("USERS", users);

                // save notification
                const notification = new Notification({
                    userId: users,
                    tweetId: tweet._id,
                    type: "keyword",
                    message: `Tweet contains keyword: ${matchedKeyword}`,
                    keyword: matchedKeyword,
                    isRead: false,
                })

                if(notification.length > 0){
                    await Notification.insertMany(notification);

                    console.log("NOTIFICATION", notification);
                }


            }
        }

        // save assets
        let asset = null;
        if (cleanImage || cleanAudio) {
            asset = new assets({
                author: subscription.UserId,
                assetsId: tweet._id,
                image: cleanImage,
                audio: cleanAudio,
            })

            await asset.save();
        }

        console.log("ASSET:", assets);

        if (subscription.plan !== "gold") {
            subscription.tweetUsed += 1;
            await subscription.save();
        }

        return res.status(201).json({
            success: true,
            message: "Tweet posted successfully",
            tweet,
            asset,
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