import "./env.js";
import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import User from "./models/user.js"
import Tweet from "./models/tweet.js"
import subscriptionRoutes from "./routes/subscriptionRoutes.js"
import { createTweet } from "./Controllers/createTweet.js"
import forgetPassword from "./Controllers/forgetpassword.js"
import bcrypt from "bcrypt";
import { UAParser } from "ua-parser-js";
import otpSchema from "./models/otpSchema.js"
import LoginHistory from "./models/loginHistory.js";
import crypto from "crypto";
import {sendOtp} from "./Controllers/optsender.js"

const app = express()
app.use(cors())
app.use(express.json(
))



const port = process.env.PORT || 5000
const url = process.env.MONGODB_URL


app.get("/", (req, res) => {
    res.send("twiller running good")
})

// Register 
app.post('/register', async (req, res) => {
    try {
        const {
            email,
            password,
            username,
            displayName
        } = req.body;

        // check if all required fields are provided

        if (
            !email ||
            !password ||
            !username ||
            !displayName
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // cheking existing user

        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email or username already exists"
            });
        }

        // Hashing password

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        // 4. Create user

        const newUser = new User({

            email: email.toLowerCase(),
            username,
            displayName,
            password: hashedPassword,
            isTemporaryPassword: false
        });


        await newUser.save();


        // 5 Don't send password to frontend

        return res.status(201).json({

            success: true,

            message: "Registration successful",

            user: {
                _id: newUser._id,
                username: newUser.username,
                displayName: newUser.displayName,
                email: newUser.email,
                avatar: newUser.avatar,
                bio: newUser.bio,
                location: newUser.location,
                website: newUser.website,
                isTemporaryPassword:
                    newUser.isTemporaryPassword
            }
        });


    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
})

//login

app.post("/login", async (req, res) => {
    try {

        const userAgent = req.headers['user-agent'];

        const parser = new UAParser(userAgent);
        const result = parser.getResult();

        const browser = result.browser.name || "Unknown";
        const operatingSystem = result.os.name || "Unknown";
        const deviceType = result.device.type || "desktop";
        const ipAddress = req.ip || req.socket.remoteAddress || "Unknown";

        console.log({
            browser,
            operatingSystem,
            deviceType,
            ipAddress
        });

        const {
            identifier,
            password
        } = req.body;

        // check if all required fields are provided
        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        //find user using email or phone

        const value = identifier.trim();

        const user = await User.findOne({
            $or: [
                { email: value.toLowerCase() },
                { phone: value }
            ]

        })

        //check user exist or not
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }


        // create base logion data

        const loginData = {
            userId: user._id,
            browser,
            operatingSystem,
            deviceType,
            ipAddress,
            loginTime: new Date()
        }

        //compare password

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {

            await LoginHistory.create({
                ...loginData,
                status: "failed",
                reason: "Invalid password"
            });

            return res.status(400).json({
                success: false,
                message: "Invalid password"
            })
        }

        // mobile time restricatipn for login

        if (deviceType === "mobile") {

            const currentTime = new Date();

            const indianTime = new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }).format(currentTime);

            const [hours, minutes] = indianTime.split(":").map(Number);

            const currentMinutes = hours * 60 + minutes;

            const startTime = 10 * 60; // 10:00 AM in minutes
            const endTime = 13 * 60; // 1:00 PM in minutes

            if (currentMinutes < startTime || currentMinutes >= endTime) {
                await LoginHistory.create({
                    ...loginData,
                    status: "blocked",
                    reason: "Login allowed only between 10:00 AM and 1:00 PM for mobile devices"
                });

                return res.status(403).json({
                    success: false,
                    message: "Login allowed only between 10:00 AM and 1:00 PM for mobile devices"
                });
            }
        }

        if (browser === "Chrome") {

            const otp = crypto.randomInt(100000, 999999).toString();

            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

            const loginHistory = await LoginHistory.create({
                ...loginData,
                status: "success",
                reason: "Chrome login required otp"
            });

            await otpSchema.deleteMany({
                userId: user._id
            });

            await otpSchema.create({
                userId: user._id,
                otp,
                expiresAt,
                loginHistoryId: loginHistory._id
            });

            await sendOtp(
                user.email,
                user.displayName,
                otp
            );

            return res.status(200).json({
                success: true,
                requiresOtp: true,
                message: "Otp sent to your register email",
                userId: user._id
            });

        }

        if(browser === "Edge"){

            await LoginHistory.create({
                ...loginData,
                status: "success",
                reason: "Edge login"
            });

            return res.status(200).json({
                success: true,
                message: "Login successful",
                user: {
                    _id: user._id,
                    username: user.username,
                    displayName: user.displayName,
                    email: user.email,
                    avatar: user.avatar,
                    bio: user.bio,
                    location: user.location,
                    website: user.website,
                    isTemporaryPassword:
                        user.isTemporaryPassword
                }
            })
        }


        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                username: user.username,
                displayName: user.displayName,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                location: user.location,
                website: user.website,
                isTemporaryPassword:
                    user.isTemporaryPassword
            }
        })

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
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

app.post("/like/:tweetid", async (req, res) => {
    try {
        const { userId } = req.body;
        const tweet = await Tweet.findById(req.params.tweetid);
        if (!tweet.likedBy.includes(userId)) {
            tweet.likes += 1;
            tweet.likedBy.push(userId);
            await tweet.save();
        }
        res.send(tweet);
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
})

//retweet 
app.post("/retweet/:tweetid", async (req, res) => {
    try {
        const { userId } = req.body;
        const tweet = await Tweet.findById(req.params.tweetid);
        if (!tweet.retweetedBy.includes(userId)) {
            tweet.retweets += 1;
            tweet.retweetedBy.push(userId);
            await tweet.save();
        }
        res.send(tweet);
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
})


//subscription api
app.use("/api/subscriptions", subscriptionRoutes);


console.log(
    "Razorpay Key:",
    process.env.RAZORPAY_API_KEY
);

// forget password api
app.post("/forget-password", forgetPassword);

app.post("/verift-otp", async (req, res) => {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) {
            return res.status(400).json({
                success: false,
                message: "otp are required"
            })
        }

        const otpRecord = await otpSchema.findOne({
            userId: userId,
            otp: otp
        })

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid otp"
            })
        }

        if (otpRecord.expiresAt < new Date()) {
            await otpSchema.deleteOne({
                userId: userId,
                otp: otp
            })

            return res.status(400).json({
                success: false,
                message: "Otp expired"
            })
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid otp"
            })
        }

        await LoginHistory.findOneAndUpdate(
            otpRecord.loginHistoryId,
            {
                status: "success",
                reason: "Otp verified"
            }
        )

        await otpSchema.deleteOne({
            _id: otpRecord._id
        })

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Otp verified",
            user: {
                _id: user._id,
                username: user.username,
                displayName: user.displayName,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                location: user.location,
                website: user.website,
                isTemporaryPassword:
                    user.isTemporaryPassword
            }
        });

    } catch (error) {
        console.error(
            "OTP verification error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
})


mongoose.connect(url).then(() => {
    console.log("connected to db");
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });
})
    .catch((error) => {
        console.log(error.message);
    })
