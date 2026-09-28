"use client";

import * as React from "react";

import axios from "axios";

import { useTranslation } from "react-i18next";

import {
    useState,
    useCallback,
} from "react";

import "@/lib/i18n";

import { Button } from "@/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { useAuth } from "@/context/AuthContext";

import PhoneEmailButton from "@/components/PhoneVerificationButton";


export default function LanguageDropdown() {


    // USER


    const { user } = useAuth();



    // TRANSLATION


    const { i18n } = useTranslation();



    // STATES


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



    // CHANGE LANGUAGE REQUEST


    const handleLanguageChange = async ({
        language,
    }: {
        language: string;
    }) => {

        // Already selected language
        if (language === appLanguage) {
            return;
        }

        // User unavailable
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

            console.log(
                "LANGUAGE REQUEST:",
                {
                    userId: user._id,
                    language,
                }
            );



            // ASK BACKEND WHICH OTP METHOD TO USE


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



            // EMAIL OTP


            if (
                response.data.method === "email"
            ) {

                setOtpMethod("email");

                setMessage(
                    "OTP sent to your registered email."
                );

                setShowOtp(true);

                return;
            }



            // PHONE OTP


            if (
                response.data.method === "phone"
            ) {

                setOtpMethod("phone");

                setMessage(
                    "Verify your phone number using Phone.Email."
                );

                setShowOtp(true);

                return;
            }



            // UNKNOWN METHOD


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



    // EMAIL OTP VERIFICATION


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


            console.log(
                "VERIFYING EMAIL OTP:",
                {
                    userId: user._id,
                    otp,
                }
            );


            const response = await axios.post(
                "http://localhost:5000/verify-otp",
                {
                    userId: user._id,
                    otp,
                }
            );


            console.log(
                "EMAIL OTP RESPONSE:",
                response.data
            );


            if (response.data.success) {

                // Change i18n language
                await i18n.changeLanguage(
                    selectedLanguage
                );


                // Update UI state
                setAppLanguage(
                    selectedLanguage
                );


                // Close dialog
                setShowOtp(false);

                // Clear OTP
                setOtp("");

                // Clear method
                setOtpMethod("");

                // Clear message
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



    // PHONE EMAIL SUCCESS


    const handlePhoneEmailSuccess = useCallback(
        async (userObj: any) => {

            if (!user?._id) {

                setMessage(
                    "User information is not available."
                );

                return;
            }


            try {

                setOtpLoading(true);

                setMessage(
                    "Phone verified. Updating language..."
                );


                console.log(
                    "PHONE.EMAIL RESULT:",
                    userObj
                );



                // GET USER JSON URL


                const userJsonUrl =
                    userObj?.user_json_url;


                if (!userJsonUrl) {

                    throw new Error(
                        "Phone.Email did not return user_json_url."
                    );

                }


                console.log(
                    "Phone.Email user_json_url:",
                    userJsonUrl
                );



                // SEND TO BACKEND


                const response = await axios.post(
                    "http://localhost:5000/verify-phone-email",
                    {
                        userId: user._id,

                        userJsonUrl,

                        language: selectedLanguage,
                    }
                );


                console.log(
                    "PHONE.EMAIL BACKEND RESPONSE:",
                    response.data
                );



                // SUCCESS


                if (response.data.success) {

                    await i18n.changeLanguage(
                        selectedLanguage
                    );


                    setAppLanguage(
                        response.data.language ||
                        selectedLanguage
                    );


                    setShowOtp(false);

                    setOtp("");

                    setOtpMethod("");

                    setMessage("");

                } else {

                    setMessage(
                        response.data.message ||
                        "Phone verification failed."
                    );

                }

            } catch (error: any) {

                console.error(
                    "Phone.Email verification error:",
                    error
                );

                setMessage(
                    error.response?.data?.message ||
                    error.message ||
                    "Phone verification failed."
                );

            } finally {

                setOtpLoading(false);

            }

        },
        [
            user?._id,
            selectedLanguage,
            i18n,
        ]
    );



    // CLOSE OTP DIALOG


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



    // RETURN UI


    return (
        <>

            {/* LANGUAGE DROPDOWN */}


            <DropdownMenu>

                <DropdownMenuTrigger
                    asChild
                >

                    <Button variant="outline">
                        Lang
                    </Button>

                </DropdownMenuTrigger>


                <DropdownMenuContent
                    className="w-40"
                >

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

                            <DropdownMenuRadioItem
                                value="en"
                            >
                                English
                            </DropdownMenuRadioItem>


                            <DropdownMenuRadioItem
                                value="hi"
                            >
                                Hindi
                            </DropdownMenuRadioItem>


                            <DropdownMenuRadioItem
                                value="fr"
                            >
                                French
                            </DropdownMenuRadioItem>


                            <DropdownMenuRadioItem
                                value="es"
                            >
                                Spanish
                            </DropdownMenuRadioItem>


                            <DropdownMenuRadioItem
                                value="pt"
                            >
                                Portuguese
                            </DropdownMenuRadioItem>


                            <DropdownMenuRadioItem
                                value="zh"
                            >
                                Chinese
                            </DropdownMenuRadioItem>

                        </DropdownMenuRadioGroup>

                    </DropdownMenuGroup>

                </DropdownMenuContent>

            </DropdownMenu>



            {/* OTP / PHONE DIALOG */}


            <Dialog
                open={showOtp}
                onOpenChange={closeOtpDialog}
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



                    {/* EMAIL OTP */}


                    {otpMethod === "email" && (

                        <div className="space-y-4">

                            <Input
                                type="text"
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
                                    : "Verify OTP"
                                }

                            </Button>

                        </div>

                    )}



                    {/* PHONE.EMAIL */}


                    {otpMethod === "phone" && (

                        <div className="space-y-4">

                            <p className="text-sm text-gray-500 text-center">
                                Click the button below to
                                verify your registered
                                phone number.
                            </p>


                            <div className="flex justify-center">

                                <PhoneEmailButton
                                    onSuccess={
                                        handlePhoneEmailSuccess
                                    }
                                />

                            </div>


                            {otpLoading && (

                                <p className="text-sm text-center">
                                    Verifying phone...
                                </p>

                            )}

                        </div>

                    )}

                </DialogContent>

            </Dialog>

        </>
    );
}