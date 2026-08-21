import crypto from "crypto";
import Subscription from "../models/Subscription.js";

export const verifySubscriptionPayment = async (req, res) =>{
    try{
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

        const generateSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY).update(razorpay_payment_id + "|" + razorpay_subscription_id).digest("hex");

        if(generateSignature !== razorpay_signature){
            return res.status(400).send({success: false, message: "Payment verification failed"});
        }

        const subscription = await Subscription.findOneAndUpdate({
            razorPaySubscriptionId: razorpay_subscription_id,
        }, {
            status: "active",
            razorPayPlanId: razorpay_payment_id,
        },
        {
            new: true,
        });

        return res.status(200).send({success: true, message: "Payment verified successfully", subscription});
    }catch(error){
        console.log(error);
        return res.status(400).send({success: false, message: "Payment verification failed"});
    }
}