import express from "express";

import {
    createSubscription,
} from "../Controllers/subscriptioncontroller.js";

import {
    verifySubscriptionPayment,
} from "../Controllers/verifysubscriptionpayment.js";

const router = express.Router();

router.post("/create", createSubscription);

router.post("/verify", verifySubscriptionPayment);

export default router;