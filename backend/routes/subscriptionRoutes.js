import express from "express";
import {createSubscription} from "../Controllers/subscriptioncontroller.js";

const router = express.Router();


router.post("/create", createSubscription);

export default router;