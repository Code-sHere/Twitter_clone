import Tweet from "../models/tweet.js"
import Subscription from "../models/Subscription.js"
import User from "../models/user.js"


export const createTweet = async (req, res) => {

    try {
        const { author, content, image } = req.body;

        console.log("Tweet request:", {
            author,
            content
        });

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
                message: "no active subscription found.",
            })
        }


        //check plan limit

        if (!subscription) {
            return res.status(400).json({
                success: false,
                message: "No active subscription found."
            });
        }

        // Check tweet limit
        if (subscription.plan !== "gold") {

            // Get start of today
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            // Get start of tomorrow
            const startOfTomorrow = new Date(startOfToday);
            startOfTomorrow.setDate(
                startOfTomorrow.getDate() + 1
            );

            // Count tweets created today
            const tweetsToday = await Tweet.countDocuments({
                author: author,
                createdAt: {
                    $gte: startOfToday,
                    $lt: startOfTomorrow,
                },
            });

            // Check daily limit
            if (tweetsToday >= subscription.tweetLimit) {
                return res.status(403).json({
                    success: false,
                    message: `Daily tweet limit reached. You can post only ${subscription.tweetLimit} tweets per day.`,
                });
            }
        }

        const tweet = new Tweet({
            author: subscription.UserId,
            content: content.trim(),
            image: image || null,
        })

        await tweet.save();

        console.log("Tweet created:", tweet._id);

        if (subscription.plan !== "gold") {
            subscription.tweetUsed += 1;

            console.log(
                "Updating tweetUsed:",
                subscription.tweetUsed
            );

            await subscription.save();
        }

        return res.status(201).json({
            success: true,
            message: "Tweet posted successfully",
            tweet,
            tweetUsed: subscription.tweetUsed,
            tweetLimit: subscription.tweetLimit,
            tweetsRemaining:
                subscription.plan === "gold"
                    ? "Unlimited"
                    : subscription.tweetLimit -
                    subscription.tweetUsed,
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