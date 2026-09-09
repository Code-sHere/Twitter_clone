import bcrypt from "bcrypt";
import User from "../models/user.js";


const register = async (req, res) => {
    try {
        const {
            email,
            password,
            username,
            displayName,
            phone,
        } = req.body;

        // checking required fields 

        if (!email || !password || !username || !displayName) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        // checking if user already exists

        const existingUser = await User.findOne({
            $or: [
                {
                    email: email.toLowerCase()
                },
                { username: username.trim() }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }

        //Hashing password

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // creating user

        const user = new User({
            email: email.toLowerCase(),
            password: hashedPassword,
            username: username.trim(),
            displayName: displayName.trim(),
            phone: phone ? phone.trim() : undefined,

            isTemporaryPassword: false,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",

            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                displayName: user.displayName,
                phone: user.phone,
                avatar: user.avatar,
                bio: user.bio,
                location: user.location,
                website: user.website,
                isTemporaryPassword: user.isTemporaryPassword,
            },
        })


    } catch (error) {
        console.error("Register Error:", error);

        return res.status(500).json({
            success: false,
            message: "Registration failed",
        });

    }
}


export default register;