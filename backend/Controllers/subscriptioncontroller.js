import Razorpay from "razorpay";
import User from "../models/user.js";
import Subscription from "../models/Subscription.js";
import PLANS from "../config/plans.js";

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});


export const createSubscription = async (req, res) => {
    try {

        if (process.env.NODE_ENV === "production") {
            const hour = Number(
                new Intl.DateTimeFormat("en-US", {
                    timeZone: "Asia/Kolkata",
                    hour: "numeric",
                    hour12: false,
                }).format(new Date())
            );
        }

        if (hour !== 10) {
            return res.status(403).json({
                success: false,
                message: "Subscription can only be created at 10:00 AM IST and 11:00 AM IST",
            })
        }

        const { plan, email } = req.body;
        console.log("BODY:", req.body, "PLAN KEYS:", Object.keys(PLANS));

        // Check plan
        const selectedPlan = PLANS[plan];

        if (!selectedPlan) {
            return res.status(400).json({
                success: false,
                message: "Plan does not exist",
            });
        }

        // Check email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        console.log("User found:", user._id);

        // Create Razorpay subscription
        const razorpaySubscription =
            await razorpayInstance.subscriptions.create({
                plan_id: selectedPlan.razorPayPlanId,
                total_count: 12,
                customer_notify: 1,
            });


        // Save subscription in MongoDB
        const subscription = await Subscription.create({
            UserId: user._id,
            email: email,
            plan: plan,
            planName: selectedPlan.name,
            razorPayPlanId: selectedPlan.razorPayPlanId,
            razorPaySubscriptionId: razorpaySubscription.id,
            amount: selectedPlan.amount,
            tweetLimit: selectedPlan.tweetLimit,
            tweetUsed: 0,
            status: "created",
        });

        return res.status(201).json({
            success: true,
            message: "Subscription created successfully",
            subscriptionId: razorpaySubscription.id,

            key: process.env.RAZORPAY_API_KEY,

            plan: {
                name: selectedPlan.name,
                amount: selectedPlan.amount,
                currency: selectedPlan.currency,
                tweetLimit: selectedPlan.tweetLimit,
            },
            user: {
                email: user.email,
                name: user.name || "",
            },
            subscription,
        });

    } catch (error) {
        console.error("Create Subscription Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create subscription",
            error: error.message,
        });
    }
};