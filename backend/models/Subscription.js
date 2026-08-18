import mongoose from "mongoose";

const SubscriptionSchema = mongoose.Schema({

    UserId: { type: mongoose.Schema.Types.ObjectId,ref: "User", required: true },

    plan :{
        type: String,
        enum: ["free","bronze","silver","gold"],
        required: true,
    },

    planName={
        type:String,
        required: true,
    },
    
    razorPayPlanId = {
        type: String,
        default: null,
    },

    razorPaySubscriptionId = {
        type: String,
        default: null,
    },

    amount: {
        type: Number,
        required: true,
    },

    tweetLimit : {
        type: Number,
        required: true,
    },

    tweetUsed :{
        type: Number,
        default: 0,
    },

    status: {
      type: String,
      enum: ["created", "active", "cancelled", "halted", "expired"],
      default: "created",
    },

    currentPeriodStart: {
      type: Date,
      default: null,
    },

    currentPeriodEnd: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Subscription", SubscriptionSchema);