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
        const { plan, email } = req.body;

        console.log("Plan:", plan);
        console.log("Email:", email);

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
                plan_id: selectedPlan.razorpayPlanId,
                total_count: 12,
                customer_notify: 1,
            });

        // Save subscription in MongoDB
        const subscription = await Subscription.create({
            UserId: user._id,
            plan: plan,
            planName: selectedPlan.name,
            razorPayPlanId: selectedPlan.razorpayPlanId,
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

            // Frontend expects data.key
            key: process.env.RAZORPAY_API_KEY,

            plan: {
                name: selectedPlan.name,
                amount: selectedPlan.amount,
                tweetLimit: selectedPlan.tweetLimit,
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