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
import cloudinary from "./config/cloudinary.js";
import upload from "./middleware/upload.js";
import { sendOtp } from "./Controllers/optsender.js"
import assets from "./models/assets.js";
import Notification from "./models/notification.js";

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

        if (browser === "Edge") {

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

// get post

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
});

// upload audio

app.post("/upload-audio", upload.single("audio"), async (req, res) => {
    try {

        const { userId, otpVerified } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required"
            })
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        if (otpVerified !== "true") {
            const otp = crypto.randomInt(100000, 999999).toString();

            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

            await otpSchema.deleteMany({
                userId: user._id,
                purpose: "audioTweet"
            })

            await otpSchema.create({
                userId: user._id,
                otp,
                purpose: "audioTweet",
                expiresAt,
                verified: false
            })

            await sendOtp(
                user.email,
                user.displayName,
                otp
            )

            return res.status(200).json({
                success: true,
                requiresOtp: true,
                message: "Otp sent to your register email",
                otp
            })
        }

        const verifiedOtp = await otpSchema.findOne({
            userId: user._id,
            purpose: "audioTweet",
            verified: true,
            expiresAt: { $gt: new Date() }
        })

        if (!verifiedOtp) {
            return res.status(400).json({
                success: false,
                message: "please verify your otp"
            })
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "audio file is required"
            })
        }

        const uploadAudio = cloudinary.uploader.upload_stream({
            resource_type: "video",
            folder: "twiller/audio"
        }, (error, result) => {
            if (error) {
                console.error("Cloudinart upload error:", error);
                return res.status(500).json({
                    success: false,
                    message: "Failed to upload audio file"
                })
            }

            const currentTime = new Date();

            const indianTime = new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }).format(currentTime);

            const [hours, minutes] = indianTime.split(":").map(Number);

            const currentMinutes = hours * 60 + minutes;

            const startTime = 14 * 60; // 2:00 PM in minutes
            const endTime = 19 * 60; // 7:00 PM in minutes

            if (currentMinutes < startTime || currentMinutes > endTime) {
                return res.status(403).json({
                    success: false,
                    message: "Audio upload allowed only between 2:00 PM and 7:00 PM"
                })
            }

            return res.status(200).json({
                success: true,
                message: "Audio file uploaded successfully",
                audioUrl: result.secure_url
            })
        })

        uploadAudio.end(req.file.buffer);

    } catch (error) {
        console.error("Audio upload error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to upload audio file"
        })
    }
});

app.get("/assets", async (req, res) => {
    try {
        const assetList = await assets.find()
            .sort({ timestamp: -1 });

        return res.status(200).json(assetList);

    } catch (error) {
        console.error(
            "Get Assets Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch assets",
            error: error.message,
        });
    }
});

app.get("/assets/:tweetId", async (req, res) => {
    try {
        const { tweetId } = req.params;

        const asset = await Assets.findOne({
            tweetId,
        });

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Assets not found",
            });
        }

        return res.status(200).json(asset);

    } catch (error) {
        console.error(
            "Get Tweet Asset Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch tweet assets",
            error: error.message,
        });
    }
});

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

app.post("/language/request", async (req, res) => {
    try {

        const { userId, language } = req.body;

        if (!userId || !language) {
            return res.status(400).json({
                success: false,
                message: "userId and langauge are required"
            })
        }

        //supported languages 
        const supporetedLanguages = [
            "en",
            "es",
            "fr",
            "hi",
            "pt",
            "zh"
        ];

        if (!supporetedLanguages.includes(language)) {
            return res.status(400).json({
                success: false,
                message: "Invalid langauge"
            })
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        if (user.language === language) {
            return res.status(400).json({
                success: false,
                message: "User already has this language"
            })
        }

        await otpSchema.deleteMany({
            userId: user._id,
            purpose: "language"
        });

        if (language === "fr") {
            if (!user.email) {
                return res.status(400).json({
                    success: false,
                    message: "User email not found"
                })
            }

            const otp = crypto.randomInt(100000, 999999).toString();

            await otpSchema.create({
                userId: user._id,
                otp,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                purpose: "language",
                verified: false
            });

            await sendOtp(
                user.email,
                user.displayName,
                otp
            )

            return res.status(200).json({
                success: true,
                language,
                message: "Otp sent successfully"
            })

        }

        if (!user.phone) {
            return res.status(400).json({
                success: false,
                message: "No registered phone number found"
            });
        }

        await otpSchema.create({
            userId: user._id,
            purpose: "languageChange",
            expiresAt: new Date(
                Date.now() + 10 * 60 * 1000
            ),
            verified: false
        });

        return res.status(200).json({
            success: true,
            method: "firebase",
            language,
            phone: user.phone,
            message: "Use Firebase to send OTP"
        });


    } catch (error) {
        console.error(
            "Language OTP request error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to request language change",
            error: error.message
        });
    }
})

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
            otp: otp.toString()
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

        //    Audio otp

        if (otpRecord.purpose === "audioTweet") {

            otpRecord.verified = true;

            await otpRecord.save();

            await otpSchema.deleteOne({
                _id: otpRecord._id
            })

            return res.status(200).json({
                success: true,
                message: "Audio OTP verified"
            });
        }

        if (otpRecord.purpose === "language") {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "User not found"
                })
            }

            user.language = "fr";

            await user.save();

            await otpSchema.deleteOne({
                _id: otpRecord._id
            })

            return res.status(200).json({
                success: true,
                message: "Language changed successfully",
                language: user.language
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

app.post("/language/verify-firebase", async (req, res) => {
    try {

        const {
            userId,
            firebaseToken,
            language
        } = req.body;

        if (!userId || !firebaseToken || !language) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        if (language === "fr") {
            return res.status(400).json({
                success: false,
                message: "Invalid langauge"
            })
        }

        const supporetedLanguages = [
            "en",
            "hi",
            "es",
            "pt",
            "zh",
            "fr"
        ]

        if (!supporetedLanguages.includes(language)) {
            return res.status(400).json({
                success: false,
                message: "Invalid langauge"
            })
        }

        // verify firebase token
        const decodeToken = await admin.auth().verifyIdToken(firebaseToken);

        const firebasePhone = decodeToken.phone_number;

        if (!firebasePhone) {
            return res.status(400).json({
                success: false,
                message: "Invalid firebase token"
            })
        }

        // find our user

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        if (firebasePhone !== user.phone) {
            return res.status(400).json({
                success: false,
                message: "Invalid firebase token"
            })
        }

        const otpRecord = await otpSchema.findOne({
            userId,
            purpose: "language",
            expiresAt: {
                $gt: new Date()
            },
            verified: false
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message:
                    "No valid language verification request found"
            });
        }

        user.language = language;

        await user.save();

        await otpSchema.deleteOne({
            _id: otpRecord._id
        })

        return res.status(200).json({
            success: true,
            message: "Language changed successfully",
            language: user.language
        })

    } catch (error) {
        console.error(
            "Firebase language verification error:",
            error
        );

        return res.status(401).json({
            success: false,
            message:
                "Firebase phone verification failed"
        });
    }
})

app.get("/settings/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select("notificationEnabled");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Settings fetched successfully",
            notificationEnabled: user.notificationEnabled
        })

    } catch (error) {
        console.log("Get notification error", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
})

app.put("/settings/:userId", async (req, res) => {
    try {

        const { userId } = req.params;
        const { notificationEnabled } = req.body;

        const user = await User.findByIdAndUpdate(userId, {
            notificationEnabled: Boolean(notificationEnabled)
        }, {
            returnDocument: "after"
        }
        ).select("notificationEnabled");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Settings updated successfully",
            notificationEnabled: user.notificationEnabled
        })

    } catch (error) {
        console.log("Update notification error", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
})
app.get("/notifications/:userId", async (req, res) => {

    try {

        const { userId } = req.params;

        const notifications = await Notification.find({
            userId: userId
        })
            .populate({
                path: "tweetId",
                populate: {
                    path: "author",
                    select: "username"
                }
            })
            .sort({
                createdAt: -1
            });


        res.status(200).json({
            success: true,
            notifications
        });


    } catch (error) {

        console.error(
            "Get notifications error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to get notifications"
        });
    }
});



mongoose.connect(url).then(() => {
    console.log("connected to db");
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });
})
    .catch((error) => {
        console.log(error.message);
    })
