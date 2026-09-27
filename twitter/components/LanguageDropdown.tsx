"use client"
import * as React from "react"
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import "@/lib/i18n";

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from "firebase/auth";
import { useAuth } from "@/context/AuthContext";

export default function LanguageDropdown() {

    const { user } = useAuth();

    const { i18n } = useTranslation();

    const [appLanguage, setAppLanguage] = useState(
        i18n.language || "en"
    );

    const [selectedLanguage, setSelectedLanguage] = useState("");

    const [otp, setOtp] = useState("");

    const [optMethod, setOtpMethod] = useState("");

    const [showOtp, setShowOtp] = useState(false);

    const [otpLoading, setOtpLoading] = useState(false);

    const [message, setMessage] = useState("");

    // firebase confirmation result
    const confirmationResultRef = useRef(null);

    // firebase recpatcha
    const createRecaptcha = () => {

        if (window.recaptchaVerifier) {
            return window.recaptchaVerifier;
        }

        window.recaptchaVerifier =
            new RecaptchaVerifier(
                auth,
                "recaptcha-container",
                {
                    size: "invisible",
                    callback: () => {
                        console.log(
                            "reCAPTCHA completed"
                        );
                    },
                }
            );

        return window.recaptchaVerifier;

    }

    // send firebase sms otp

    const sendFirebaseOTP = async ({ phone }: { phone: string }) => {

        try {

            const appVerifier = createRecaptcha();

            const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);

            confirmationResultRef.current = confirmationResult;

            console.log("confirmationResult", confirmationResult);

            return true;

        } catch (error) {

            console.error(
                "Firebase OTP error:",
                error
            );

            return false;
        }
    };

    const handleLanguageChange = async ({ language }: { language: string }) => {
        if (language === appLanguage) {
            return;
        }

        if (!user?._id) {
            setMessage("User information is not available.");
            return;
        }

        try {
            setOtpLoading(true);

            setSelectedLanguage(language);

            console.log("LANGUAGE REQUEST:", {
                userId: user?._id,
                language: language
            });
            const response = await axios.post("http://localhost:5000/language/request", {
                userId: user._id,
                language
            })

            if (response.data.method === "email") {
                setOtpMethod("email");

                setMessage("Otp sent to your email");

                setShowOtp(true);
            } else if (
                response.data.method === "firebase"
            ) {
                setOtpMethod("firebase");

                const sent = await sendFirebaseOTP(response.data.phone)

                if (!sent) {
                    setMessage("Something went wrong");
                    return;
                }

                setMessage("Otp sent to your phone number");

                setShowOtp(true);
            }

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
    }

    const verifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            setMessage("Please enter a valid OTP");
            return;
        }

        try {
            setOtpLoading(true);
            if (optMethod === "email") {
                const response = await axios.post("http://localhost:5000/verify-otp", {
                    userId: user._id,
                    otp
                });

                if (response.data.success) {
                    await il8n.changeLanguage(selectedLanguage);
                }

                setAppLanguage(selectedLanguage);

                setShowOtp(false);

                setOtp("");

                setMessage("");
            } else if (optMethod === "firebase") {
                if (!confirmationResultRef.current) {
                    return;
                }

                await confirmationResultRef.current.confirm(otp);

                // get firebase ID token

                const idToken = await result.user.getIdToken();

                // save firebase ID token to server

                const response = await axios.post("http://localhost:5000/verify-firebase", {
                    userId: user._id,
                    firebaseToken: idToken,
                    language: selectedLanguage
                });

                if (response.data.success) {
                    await il8n.changeLanguage(selectedLanguage);
                }
                setAppLanguage(response.data.language);

                setShowOtp(false);

                setOtp("");

                setMessage("");

            }

        } catch (error: any) {

            console.error(
                "OTP verification error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Internal server error"
            );

        } finally {
            setOtpLoading(false);
        }
    }

    const closeotpDialog = () => {
        setShowOtp(false);
        setOtp("");
        setMessage("");

        confirmationResultRef.current = null;
    }


    return (
        <>
            <DropdownMenu>

                <DropdownMenuTrigger asChild>

                    <Button variant="outline">
                        Lang
                    </Button>

                </DropdownMenuTrigger>


                <DropdownMenuContent className="w-40">

                    <DropdownMenuGroup>

                        <DropdownMenuLabel>
                            Languages
                        </DropdownMenuLabel>


                        <DropdownMenuRadioGroup
                            value={appLanguage}
                            onValueChange={(value) =>{
                                handleLanguageChange({ language: value });}
                            }
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


            {/* =================================
          OTP DIALOG
          ================================= */}

            <Dialog
                open={showOtp}
                onOpenChange={closeotpDialog}
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


                    <div className="space-y-4">

                        <Input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            maxLength={6}
                            onChange={(e) =>
                                setOtp(
                                    e.target.value.replace(
                                        /\D/g,
                                        ""
                                    )
                                )
                            }
                        />


                        <Button
                            className="w-full"
                            disabled={
                                otpLoading ||
                                otp.length !== 6
                            }
                            onClick={verifyOtp}
                        >

                            {otpLoading
                                ? "Verifying..."
                                : "Verify OTP"}

                        </Button>

                    </div>

                </DialogContent>

            </Dialog>


            {/* Firebase invisible reCAPTCHA */}

            <div
                id="recaptcha-container"
            />

        </>
    );
}
