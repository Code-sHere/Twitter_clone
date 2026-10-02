"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { User, X, Mail, Lock, Eye, EyeOff, Phone } from "lucide-react";
import TwitterLogo from "./Twitterlogo";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Loadingspinner from "./Loading-spinner";
import { Separator } from "./ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
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


    useEffect(() => {
        console.log("AuthModal MOUNTED");
        return () => console.log("AuthModal UNMOUNTED");
    }, []);

    const { login, signup, verifyOtp, isLoading, isAuthenticating } = useAuth();
    const { t } = useTranslation();

    const [mode, setMode] = useState<"login" | "signup">(initialMode);
    const [showPassword, setShowPassword] = useState(false);

    const [otpMode, setOtpMode] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpUserId, setOtpUserId] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
        displayName: "",
        phone: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = "auth.errors.emailRequired";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "auth.errors.emailInvalid";
        }

        if (!formData.password.trim()) {
            newErrors.password = "auth.errors.passwordRequired";
        } else if (formData.password.length < 6) {
            newErrors.password = "auth.errors.passwordMin";
        }

        if (mode === "signup") {
            if (!formData.username.trim()) {
                newErrors.username = "auth.errors.usernameRequired";
            } else if (formData.username.length < 3) {
                newErrors.username = "auth.errors.usernameMin";
            } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
                newErrors.username = "auth.errors.usernameChars";
            }

            if (!formData.displayName.trim()) {
                newErrors.displayName = "auth.errors.displayNameRequired";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || isAuthenticating) return;

        try {
            if (mode === "login") {

                const result = await login(formData.email, formData.password);

                console.log(result);

                if (result?.requiresOtp) {
                    console.log("1️⃣ OTP RESULT:", result);
                    setOtpMode(true);
                    setOtpUserId(result.userId || "");
                    setErrors({});
                    console.log("2️⃣ OTP STATE SET CALLED");
                    return;
                }

            } else {
                await signup(
                    formData.email,
                    formData.password,
                    formData.username,
                    formData.displayName,
                    formData.phone
                );
            }

            onClose();

            setFormData({
                email: "",
                password: "",
                username: "",
                displayName: "",
                phone: "",
            });

            setErrors({});
        } catch (error) {
            console.error("Authentication error:", error);

            setErrors({
                general: "auth.errors.generic",
            });
        }
    };

    const handleOtpSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        if (!otp || otp.length !== 6) {
            setErrors({
                general: "auth.errors.otpInvalid"
            })
            return;
        }

        if (!otpUserId) {
            setErrors({
                general: "auth.errors.otpUserIdMissing",
            });
            return;
        }

        try {
            await verifyOtp(otpUserId, otp);

            setOtp("");
            setOtpUserId("");
            setOtpMode(false);

            onClose();

            setFormData({
                email: "",
                password: "",
                username: "",
                displayName: "",
                phone: "",
            });
            setErrors({})
        } catch (error) {
            console.error("Authentication error:", error);

            setErrors({
                general: "auth.errors.generic",
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
            phone: "",
        });
    };

    console.log("AUTH MODAL RENDER:", {
        isOpen,
        otpMode,
        otpUserId,
        isLoading,
    });
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
                            {otpMode
                                ? ("auth.verifyLoginTitle")
                                : mode === "login"
                                    ? ("auth.signInTitle")
                                    : ("auth.createAccountTitle")}
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

                        {otpMode ? (
                            <>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="otp"
                                        className="text-white"
                                    >
                                        {("auth.verificationCode")}
                                    </Label>

                                    <Input
                                        id="otp"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder={("auth.otpPlaceholder")}
                                        value={otp}
                                        onChange={(e) => {
                                            const value = e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 6);

                                            setOtp(value);

                                            if (errors.general) {
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    general: "",
                                                }));
                                            }
                                        }}
                                        maxLength={6}
                                        className="
                    h-11
                    bg-transparent
                    border-gray-600
                    text-white
                    placeholder-gray-400
                    focus:border-blue-500
                    text-center
                    tracking-[0.4em]
                    text-lg
                "
                                        disabled={isAuthenticating}
                                    />
                                </div>

                                <p className="text-sm text-gray-400 text-center">
                                    {("auth.otpSent")}
                                </p>

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
            "
                                    disabled={isAuthenticating || otp.length !== 6}
                                >
                                    {isAuthenticating ? (
                                        <div className="flex items-center gap-2">
                                            <Loadingspinner size="sm" />
                                            <span>Verifying...</span>
                                        </div>
                                    ) : (
                                        ("auth.verifyOtp")
                                    )}
                                </Button>
                            </>
                        ) : (
                            <>
                                {/* Signup Fields */}
                                {mode === "signup" && (
                                    <>
                                        {/* Display Name */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="displayName"
                                                className="text-white"
                                            >
                                                {("auth.displayName")}
                                            </Label>

                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

                                                <Input
                                                    id="displayName"
                                                    type="text"
                                                    placeholder={("auth.displayNamePlaceholder")}
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
                                                    disabled={isAuthenticating}
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
                                                {("auth.username")}
                                            </Label>

                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                    @
                                                </span>

                                                <Input
                                                    id="username"
                                                    type="text"
                                                    placeholder={("auth.usernamePlaceholder")}
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
                                                    disabled={isAuthenticating}
                                                />
                                            </div>

                                            {errors.username && (
                                                <p className="text-red-400 text-xs sm:text-sm">
                                                    {errors.username}
                                                </p>
                                            )}
                                        </div>

                                        {/* Phone Number */}

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="phone"
                                                className="text-white"
                                            >
                                                {("auth.phone")}
                                            </Label>

                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    inputMode="numeric"
                                                    placeholder={("auth.phonePlaceholder")}
                                                    value={formData.phone}
                                                    maxLength={10}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                            .replace(/\D/g, "")
                                                            .slice(0, 10);

                                                        handleInputChange("phone", value);
                                                    }}
                                                    className="
                                                        h-11
                                                        pl-10
                                                        bg-transparent
                                                    border-gray-600
                                                    text-white
                                                    placeholder-gray-400
                                                    focus:border-blue-500
                                                    "
                                                    disabled={isAuthenticating}
                                                />
                                            </div>

                                            {errors.phone && (
                                                <p className="text-red-400 text-xs sm:text-sm">
                                                    {errors.phone}
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
                                        {("auth.email")}
                                    </Label>

                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder={("auth.emailPlaceholder")}
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
                                            disabled={isAuthenticating}
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
                                        {("auth.password")}
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
                                            placeholder={("auth.passwordPlaceholder")}
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
                                            disabled={isAuthenticating}
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
                                    disabled={isAuthenticating}
                                >
                                    {isAuthenticating ? (
                                        <div className="flex items-center gap-2">
                                            <Loadingspinner size="sm" />

                                            <span>
                                                {mode === "login"
                                                    ? ("auth.signingIn")
                                                    : ("auth.creatingAccount")}
                                            </span>
                                        </div>
                                    ) : mode === "login" ? (
                                        ("auth.signIn")
                                    ) : (
                                        ("auth.createAccount")
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
                                    {("auth.forgotPassword")}
                                </Link>
                            </>
                        )}

                    </form>

                    {!otpMode && (
                        <>
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
                                        ? ("auth.dontHaveAccount")
                                        : ("auth.alreadyHaveAccount")}

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
                                        disabled={isAuthenticating}
                                    >
                                        {mode === "login"
                                            ? ("auth.signUp")
                                            : ("auth.signIn")}
                                    </Button>
                                </p>
                            </div>

                            {mode === "signup" && (
                                <div className="text-center text-xs text-gray-400 mt-5 leading-relaxed">
                                    By signing up, you agree to our Terms of Service
                                    and Privacy Policy, including Cookie Use.
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AuthModal;