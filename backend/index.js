import "./env.js";
import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import User from "./models/user.js"
import Tweet from "./models/tweet.js"
import subscriptionRoutes from "./routes/subscriptionRoutes.js"
import { createTweet } from "./Controllers/createTweet.js"


const app = express()
app.use(cors())
app.use(express.json(
))

app.get("/", (req, res) => {
    res.send("twiller running good")
})

const port = process.env.PORT || 5000
const url = process.env.MONGODB_URL

mongoose.connect(url).then(() => {
    console.log("connected to db");
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });
})
    .catch((error) => {
        console.log(error.message);
    })


// Register 
app.post('/register', async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email })
        if (existingUser) {
            return res.status(200).send(existingUser)
        }
        const newUser = new User(req.body);
        await newUser.save();
        return res.status(201).send(newUser);
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
})

//loggedinUser
app.get('/loggedinuser', async (req, res) => {
    try {
        const { email } = req.query

        if (!email) {
            return res.status(400).send({ error: "email required" });
        }
        const user = await User.findOne({ email: email });
        return res.status(200).send(user);
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
})

//update profile

app.patch("/userupdate/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const updated = await User.findOneAndUpdate(
            { email },
            { $set: req.body },
            { new: true, upsert: true }
        );
        return res.status(200).send(updated);
    } catch (error) {
        return res.status(400).send({ error: "update failed" });
    }
})

//tweet api
app.post("/post", createTweet);

app.get("/post", async (req, res) => {
    try {
        const tweets = await Tweet.find()
            .sort({ timestamp: -1 })
            .populate("author");

        return res.status(200).send(tweets);

    } catch (error) {
        return res.status(400).send({
            error: error.message
        });
    }
})

//Like tweet

app.post("/like/:tweetid", async (req, res)=>{
    try{
        const {userId} = req.body;
        const tweet = await Tweet.findById(req.params.tweetid);
        if(!tweet.likedBy.includes(userId)){
            tweet.likes += 1;
            tweet.likedBy.push(userId);
            await tweet.save();
        }
        res.send(tweet);
    }catch(error){
        return res.status(400).send({error: error.message});
    }
})

//retweet 
app.post("/retweet/:tweetid", async (req, res)=>{
    try{
        const {userId} = req.body;
        const tweet = await Tweet.findById(req.params.tweetid);
        if(!tweet.retweetedBy.includes(userId)){
            tweet.retweets += 1;
            tweet.retweetedBy.push(userId);
            await tweet.save();
        }
        res.send(tweet);
    }catch(error){
        return res.status(400).send({error: error.message});
    }
})


//subscription api
app.use("/api/subscriptions", subscriptionRoutes);


console.log(
    "Razorpay Key:",
    process.env.RAZORPAY_API_KEY
);
app.listen(5000, () => {
    console.log("Server running on port 5000");
});