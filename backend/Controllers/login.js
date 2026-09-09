import bcrypt from "bcrypt";
import User from "../models/user.js";

const login = async (req, res) => {
    try {
        const {
            identifier,
            password
        } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: "Email/Username and password are required"
            })
        }

        const value = identifier.trim();

        // find the user using email or username
        const user = await User.findOne({
            $or: [
                { email: value.toLowerCase() },
                { username: value }
            ],
        })

        //user not found
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            })
        }

        // user authenticated successfully

        return res.status(200).json({
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
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again",
        });

    }
}

export default login;