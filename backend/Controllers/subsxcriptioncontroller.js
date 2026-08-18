const razorpay = require("../config/razorpay");
const PLANS = require("../config/plans");
const Subscription = require("../models/subscription");

const createSubscription = async (req, res) => {
    try {
        const { plan } = req.body;

        //check if plan exists
        const selectedPlan = PLANS[plan];
        if (!selectedPlan) {
            return res.status(400).send({
                success: false,
                message: "Plan does not exist",
            });
        }

        //get logged in user
        const userId = req.user.id;

        //create razorpay subscription
        const razorpaysubscription = await razorpay.subscriptions.create({
            plan_id: selectedPlan.razorpayPlanId,
            total_count: 12,
            customer_notify: 1,
        })

        //save subscription in database
        const subscription = await razorpay.subscription.create({
            userId,
            plan,
            planName: selectedPlan.name,
            razorPayPlanId: selectedPlan.razorpayPlanId,
            razorPaySubscriptionId: razorpaysubscription.id,
            amount: selectedPlan.amount,
            tweetLimit: selectedPlan.tweetLimit,
            tweetUsed: 0,
            status: "created",
        })

        // send response

        return res.status(201).jsonn({
            success: true,
            message: "Subscription created successfully",
            subscriptionId: razorpaysubscription.id,
            razorpayKey: process.env.RAZORPAY_API_KEY,

            plan: {
                name: selectedPlan.name,
                amount: selectedPlan.amount,
                tweetLimit: selectedPlan.tweetLimit
            },
            subscription,
        })

    } catch (error) {
        console.error("Create Subscription Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create subscription",
            error: error.message,
        });
    }
}