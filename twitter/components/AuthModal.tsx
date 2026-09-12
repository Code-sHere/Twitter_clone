"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { User, X, Mail, Lock, Eye, EyeOff } from "lucide-react";
import TwitterLogo from "./Twitterlogo";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Loadingspinner from "./Loading-spinner";
import { Separator } from "./ui/separator";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";


interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: "login" | "signup";
}

const AuthModal = ({
    isOpen,
    onClose,
    initialMode = "login",
}: AuthModalProps) => {
    const { login, signup, verifyOtp , isLoading } = useAuth();

    const [mode, setMode] = useState<"login" | "signup">(initialMode);
    const [showPassword, setShowPassword] = useState(false);

    const [otpMode, setOtpMode] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpUserId, setOtpUSerId] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
        displayName: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (mode === "signup") {
            if (!formData.username.trim()) {
                newErrors.username = "Username is required";
            } else if (formData.username.length < 3) {
                newErrors.username = "Username must be at least 3 characters";
            } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
                newErrors.username =
                    "Username can only contain letters, numbers, and underscores";
            }

            if (!formData.displayName.trim()) {
                newErrors.displayName = "Display name is required";
            }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || isLoading) return;

        try {
            if (mode === "login") {
                await login(formData.email, formData.password);

                if(result?.requiresOtp){
                    setOtpMode(true);
                    setOtpUSerId(result.userId);
                }

                return;

            } else {
                await signup(
                    formData.email,
                    formData.password,
                    formData.username,
                    formData.displayName
                );
            }

            onClose();

            setFormData({
                email: "",
                password: "",
                username: "",
                displayName: "",
            });

            setErrors({});
        } catch (error) {
            console.error("Authentication error:", error);

            setErrors({
                general: "Something went wrong. Please try again.",
            });
        }
    };

    const handleOtpSubmit = async (
        e: React.FormEvent
    )=>{
        if(!otp || otp.length !==6){
            setErrors({
                general: "Please enter a valid OTP"
            })

            return;

        }

        if(!otpUserId){
            setErrors({
                general: "Something went wrong. Please try again.",
            });

            return;
        }

        try{
            await verifyOtp(otpUserId, otp);

            onClose();

            setFormData({
                email: "",
                password: "",
                username: "",
                displayName: "",
            });
            setErrors({})
        } catch(error){
            console.error("Authentication error:", error);

            setErrors({
                general: "Something went wrong. Please try again.",
            });
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    const switchMode = () => {
        setMode(mode === "login" ? "signup" : "login");
        setErrors({});

        setFormData({
            email: "",
            password: "",
            username: "",
            displayName: "",
        });
    };

    return (
        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/70
                backdrop-blur-sm
                p-3
                sm:p-4
            "
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <Card
                className="
                    relative
                    w-full
                    max-w-md
                    max-h-[92vh]
                    sm:max-h-[90vh]
                    overflow-y-auto
                    overflow-x-hidden
                    bg-black
                    border
                    border-gray-800
                    rounded-xl
                    sm:rounded-2xl
                "
            >
                {/* Close */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="
                        absolute
                        right-2
                        top-2
                        sm:right-4
                        sm:top-4
                        z-10
                        text-white
                        hover:bg-gray-900
                        rounded-full
                    "
                >
                    <X className="h-4 w-4" />
                </Button>

                <CardHeader className="px-4 sm:px-6 pt-6 sm:pt-8">
                    <div className="text-center">
                        <div className="mb-4 sm:mb-6 flex justify-center">
                            <TwitterLogo
                                size="xl"
                                className="text-white w-10 h-10 sm:w-12 sm:h-12"
                            />
                        </div>

                        <CardTitle className="text-xl sm:text-2xl font-bold text-white">
                            {mode === "login"
                                ? "Sign in to X"
                                : "Create your account"}
                        </CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="px-4 sm:px-6 pb-6">
                    {errors.general && (
                        <div className="mb-4 bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
                            {errors.general}
                        </div>
                    )}

                    <form
                        onSubmit={otpMode ? handleOtpSubmit : handleSubmit}
                        className="space-y-4"
                    >
                        {/* Signup Fields */}
                        {mode === "signup" && (
                            <>
                                {/* Display Name */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="displayName"
                                        className="text-white"
                                    >
                                        Display Name
                                    </Label>

                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

                                        <Input
                                            id="displayName"
                                            type="text"
                                            placeholder="Your display name"
                                            value={formData.displayName}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "displayName",
                                                    e.target.value
                                                )
                                            }
                                            className="
                                                h-11
                                                pl-10
                                                bg-transparent
                                                border-gray-600
                                                text-white
                                                placeholder-gray-400
                                                focus:border-blue-500
                                            "
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {errors.displayName && (
                                        <p className="text-red-400 text-xs sm:text-sm">
                                            {errors.displayName}
                                        </p>
                                    )}
                                </div>

                                {/* Username */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="username"
                                        className="text-white"
                                    >
                                        Username
                                    </Label>

                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            @
                                        </span>

                                        <Input
                                            id="username"
                                            type="text"
                                            placeholder="username"
                                            value={formData.username}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "username",
                                                    e.target.value
                                                )
                                            }
                                            className="
                                                h-11
                                                pl-8
                                                bg-transparent
                                                border-gray-600
                                                text-white
                                                placeholder-gray-400
                                                focus:border-blue-500
                                            "
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {errors.username && (
                                        <p className="text-red-400 text-xs sm:text-sm">
                                            {errors.username}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="text-white"
                            >
                                Email
                            </Label>

                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "email",
                                            e.target.value
                                        )
                                    }
                                    className="
                                        h-11
                                        pl-10
                                        bg-transparent
                                        border-gray-600
                                        text-white
                                        placeholder-gray-400
                                        focus:border-blue-500
                                    "
                                    disabled={isLoading}
                                />
                            </div>

                            {errors.email && (
                                <p className="text-red-400 text-xs sm:text-sm">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className="text-white"
                            >
                                Password
                            </Label>

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

                                <Input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "password",
                                            e.target.value
                                        )
                                    }
                                    className="
                                        h-11
                                        pl-10
                                        pr-10
                                        bg-transparent
                                        border-gray-600
                                        text-white
                                        placeholder-gray-400
                                        focus:border-blue-500
                                    "
                                    disabled={isLoading}
                                />

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="
                                        absolute
                                        right-1
                                        top-1/2
                                        -translate-y-1/2
                                        text-gray-400
                                        hover:text-white
                                    "
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            {errors.password && (
                                <p className="text-red-400 text-xs sm:text-sm">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="
                                w-full
                                h-11
                                sm:h-12
                                bg-blue-500
                                hover:bg-blue-600
                                text-white
                                font-semibold
                                rounded-full
                                text-base
                            "
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loadingspinner size="sm" />

                                    <span>
                                        {mode === "login"
                                            ? "Signing in..."
                                            : "Creating account..."}
                                    </span>
                                </div>
                            ) : mode === "login" ? (
                                "Sign in"
                            ) : (
                                "Create account"
                            )}
                        </Button>
                        {/* forget password */}
                        <Link 
                        href="/forget-password"
                        className=" flex justify-center
                                    mt-2
                                    text-center             
                                    text-white
                                    font-semibold
                                    rounded-full
                                    text-base"
                        >
                            Forgot Password?
                        </Link>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <Separator className="bg-gray-700" />

                        <span
                            className="
                                absolute
                                left-1/2
                                top-1/2
                                -translate-x-1/2
                                -translate-y-1/2
                                bg-black
                                px-2
                                text-gray-400
                                text-xs
                            "
                        >
                            OR
                        </span>
                    </div>

                    {/* Switch */}
                    <div className="text-center">
                        <p className="text-sm sm:text-base text-gray-400">
                            {mode === "login"
                                ? "Don't have an account?"
                                : "Already have an account?"}

                            <Button
                                type="button"
                                variant="link"
                                className="
                                    text-blue-400
                                    hover:text-blue-300
                                    font-semibold
                                    pl-1
                                "
                                onClick={switchMode}
                                disabled={isLoading}
                            >
                                {mode === "login"
                                    ? "Sign up"
                                    : "Sign in"}
                            </Button>
                        </p>
                    </div>

                    {mode === "signup" && (
                        <div className="text-center text-xs text-gray-400 mt-5 leading-relaxed">
                            By signing up, you agree to our Terms of Service
                            and Privacy Policy, including Cookie Use.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AuthModal;