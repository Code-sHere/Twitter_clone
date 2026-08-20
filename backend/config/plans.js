const PLANS = {
    bronze : {
        name : "Bronze",
        amount : 100,
        tweetLimit : 3,
        razorpayPlanId : process.env.RAZORPAY_BRONZE_PLAN_ID,
    },

    silver : {
        name : "Silver",
        amount : 300,
        tweetLimit : 5,
        razorpayPlanId : process.env.RAZORPAY_SILVER_PLAN_ID,
    },

    gold : {
        name : "Gold",
        amount : 1000,
        tweetLimit : -1,
        razorpayPlanId : process.env.RAZORPAY_GOLD_PLAN_ID,
    },
};
export default PLANS;