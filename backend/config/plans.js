const PLANS = {
    bronze : {
        name : "Bronze",
        amount : 10000,
        tweetLimit : 3,
        razorPayPlanId : process.env.RAZORPAY_BRONZE_PLAN_ID,
    },

    silver : {
        name : "Silver",
        amount : 30000,
        tweetLimit : 5,
        razorPayPlanId : process.env.RAZORPAY_SILVER_PLAN_ID,
    },

    gold : {
        name : "Gold",
        amount : 100000,
        tweetLimit : -1,
        razorPayPlanId : process.env.RAZORPAY_GOLD_PLAN_ID,
    },
};
export default PLANS;