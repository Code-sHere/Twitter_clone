"use client";

import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LanguageDropdown() {
    const { user } = useAuth();
    const { i18n } = useTranslation();

    const [appLanguage, setAppLanguage] = useState(
        i18n.language || "en"
    );

    const [selectedLanguage, setSelectedLanguage] =
        useState("");

    const [otp, setOtp] = useState("");

    const [otpMethod, setOtpMethod] =
        useState<"email" | "phone" | "">("");

    const [showOtp, setShowOtp] =
        useState(false);

    const [otpLoading, setOtpLoading] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const handleLanguageChange = async ({
        language,
    }: {
        language: string;
    }) => {
        if (language === appLanguage) {
            return;
        }

        if (!user?._id) {
            setMessage(
                "User information is not available."
            );
            return;
        }

        try {
            setOtpLoading(true);
            setSelectedLanguage(language);
            setMessage("");
            setOtp("");

            const response = await axios.post(
                "http://localhost:5000/language/request",
                {
                    userId: user._id,
                    language,
                }
            );

            console.log(
                "LANGUAGE REQUEST RESPONSE:",
                response.data
            );

            if (response.data.method === "email") {
                setOtpMethod("email");

                setMessage(
                    "OTP sent to your registered email."
                );

                setShowOtp(true);

                return;
            }

            if (response.data.method === "phone") {
                setOtpMethod("phone");

                setMessage(
                    "OTP sent to your registered phone number."
                );

                setShowOtp(true);

                return;
            }

            setMessage(
                "Invalid OTP verification method."
            );

        } catch (error: any) {
            console.error(
                "Language change error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to request language change."
            );

        } finally {
            setOtpLoading(false);
        }
    };

    const verifyEmailOtp = async () => {
        if (!otp || otp.length !== 6) {
            setMessage(
                "Please enter a valid 6-digit OTP."
            );
            return;
        }

        if (!user?._id) {
            setMessage(
                "User information is not available."
            );
            return;
        }

        try {
            setOtpLoading(true);

            const response = await axios.post(
                "http://localhost:5000/verift-otp",
                {
                    userId: user._id,
                    otp,
                }
            );

            if (response.data.success) {
                await i18n.changeLanguage(
                    selectedLanguage
                );

                setAppLanguage(
                    selectedLanguage
                );

                setShowOtp(false);
                setOtp("");
                setOtpMethod("");
                setSelectedLanguage("");
                setMessage("");

            } else {
                setMessage(
                    response.data.message ||
                    "Invalid OTP."
                );
            }

        } catch (error: any) {
            console.error(
                "Email OTP verification error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "OTP verification failed."
            );

        } finally {
            setOtpLoading(false);
        }
    };

    const verifyPhoneOtp = async () => {
        if (!otp || otp.length !== 6) {
            setMessage(
                "Please enter a valid 6-digit OTP."
            );
            return;
        }

        if (!user?._id) {
            setMessage(
                "User information is not available."
            );
            return;
        }

        if (!selectedLanguage) {
            setMessage(
                "Language selection is missing."
            );
            return;
        }

        try {
            setOtpLoading(true);

            const response = await axios.post(
                "http://localhost:5000/verify-phone",
                {
                    userId: user._id,
                    otp,
                    language: selectedLanguage
                }
            );

            console.log(
                "PHONE OTP RESPONSE:",
                response.data
            );

            if (response.data.success) {
                await i18n.changeLanguage(
                    response.data.language ||
                    selectedLanguage
                );

                setAppLanguage(
                    response.data.language ||
                    selectedLanguage
                );

                setShowOtp(false);
                setOtp("");
                setOtpMethod("");
                setSelectedLanguage("");
                setMessage("");

            } else {
                setMessage(
                    response.data.message ||
                    "Invalid OTP."
                );
            }

        } catch (error: any) {
            console.error(
                "Phone OTP verification error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Phone OTP verification failed."
            );

        } finally {
            setOtpLoading(false);
        }
    };

    const closeOtpDialog = () => {
        if (otpLoading) {
            return;
        }

        setShowOtp(false);
        setOtp("");
        setMessage("");
        setOtpMethod("");
        setSelectedLanguage("");
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        {appLanguage.toUpperCase()}
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-40">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>
                            Languages
                        </DropdownMenuLabel>

                        <DropdownMenuRadioGroup
                            value={appLanguage}
                            onValueChange={(value) => {
                                handleLanguageChange({
                                    language: value,
                                });
                            }}
                        >
                            <DropdownMenuRadioItem value="en">
                                English
                            </DropdownMenuRadioItem>

                            <DropdownMenuRadioItem value="hi">
                                Hindi
                            </DropdownMenuRadioItem>

                            <DropdownMenuRadioItem value="fr">
                                French
                            </DropdownMenuRadioItem>

                            <DropdownMenuRadioItem value="es">
                                Spanish
                            </DropdownMenuRadioItem>

                            <DropdownMenuRadioItem value="pt">
                                Portuguese
                            </DropdownMenuRadioItem>

                            <DropdownMenuRadioItem value="zh">
                                Chinese
                            </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog
                open={showOtp}
                onOpenChange={(open) => {if (!open) closeOtpDialog();}}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Verify Language Change
                        </DialogTitle>

                        <DialogDescription>
                            {message}
                        </DialogDescription>
                    </DialogHeader>

                    {otpMethod === "email" && (
                        <div className="space-y-4">
                            <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                maxLength={6}
                                onChange={(e) => {
                                    setOtp(
                                        e.target.value.replace(
                                            /\D/g,
                                            ""
                                        )
                                    );
                                }}
                            />

                            <Button
                                className="w-full"
                                disabled={
                                    otpLoading ||
                                    otp.length !== 6
                                }
                                onClick={
                                    verifyEmailOtp
                                }
                            >
                                {otpLoading
                                    ? "Verifying..."
                                    : "Verify OTP"}
                            </Button>
                        </div>
                    )}

                    {otpMethod === "phone" && (
                        <div className="space-y-4">
                            <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                maxLength={6}
                                onChange={(e) => {
                                    setOtp(
                                        e.target.value.replace(
                                            /\D/g,
                                            ""
                                        )
                                    );
                                }}
                            />

                            <Button
                                className="w-full"
                                disabled={
                                    otpLoading ||
                                    otp.length !== 6
                                }
                                onClick={
                                    verifyPhoneOtp
                                }
                            >
                                {otpLoading
                                    ? "Verifying..."
                                    : "Verify OTP"}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}