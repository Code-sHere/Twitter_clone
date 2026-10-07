import crypto from "crypto";
import Subscription from "../models/Subscription.js";
import { sendPaymentEmail } from "./emailsender.js";
import User from "../models/user.js";

export const verifySubscriptionPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
        } = req.body;

        if (
            !razorpay_payment_id ||
            !razorpay_subscription_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,

                message:
                    "Missing payment details",
            });
        }

        const generateSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY).update(`${razorpay_payment_id}|${razorpay_subscription_id}`).digest("hex");

        if (generateSignature !== razorpay_signature) {
            return res.status(400).send({ success: false, message: "Payment verification failed" });
        }

        // get billing period 
        let currentPeriodStart = new Date();
        let currentPeriodEnd = null;
        try {
            const rzpSub = await razorpayInstance.subscriptions.fetch(razorpay_subscription_id);
            if (rzpSub.current_start) currentPeriodStart = new Date(rzpSub.current_start * 1000);
            if (rzpSub.current_end) currentPeriodEnd = new Date(rzpSub.current_end * 1000);
        } catch (e) {
            console.warn("Could not fetch Razorpay subscription period:", e.message);
        }

        // update subscription (fields match your schema)
        const subscription = await Subscription.findOneAndUpdate(
            { razorPaySubscriptionId: razorpay_subscription_id },
            {
                status: "active",
                razorPayPaymentId: razorpay_payment_id,
                currentPeriodStart,
                currentPeriodEnd,
                lastResetDate: new Date(),
                tweetUsed: 0,
            },
            { new: true }
        );
        if (!subscription) {
            return res.status(404).json({ success: false, message: "Subscription not found" });
        }

        // 5. Get user via UserId (capital U, as in schema)
        const user = await User.findById(subscription.UserId);

        // 6. Send email (don't fail the payment if email fails)
        try {
            await sendPaymentEmail({
                email: subscription.email,
                name: user?.name || "",
                planName: subscription.planName,
                amount: subscription.amount,
                paymentId: subscription.razorPayPaymentId,
                subscriptionId: subscription.razorPaySubscriptionId,
            });
        } catch (e) {
            console.error("Payment email failed:", e.message);
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            subscription,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({ success: false, message: "Payment verification failed" });
    }
}