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

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

// Language names are shown in their own language on purpose,
// so a user can always find theirs even if the UI is in another language.
const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "fr", label: "Français" },
    { code: "es", label: "Español" },
    { code: "pt", label: "Português" },
    { code: "zh", label: "中文" },
];

export default function LanguageDropdown() {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();

    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [otp, setOtp] = useState("");
    const [otpMethod, setOtpMethod] = useState<"email" | "phone" | "">("");
    const [showOtp, setShowOtp] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [message, setMessage] = useState("");

    // current language comes straight from i18n (no separate state)
    const appLanguage = i18n.language?.split("-")[0] || "en";

    const resetDialog = () => {
        setShowOtp(false);
        setOtp("");
        setOtpMethod("");
        setSelectedLanguage("");
        setMessage("");
    };

    // change the whole app's language and remember it
    const applyLanguage = async (lang: string) => {
        await i18n.changeLanguage(lang);
        try {
            localStorage.setItem("lang", lang);
        } catch {
            /* storage unavailable, ignore */
        }
    };

    const handleLanguageChange = async (language: string) => {
        if (language === appLanguage) return;

        if (language === "en") {
            await applyLanguage("en");
            return;
        }

        if (!user?._id) {
            setMessage(t("language.userUnavailable"));
            return;
        }

        try {
            setOtpLoading(true);
            setSelectedLanguage(language);
            setMessage("");
            setOtp("");

            const response = await axios.post(`${API}/language/request`, {
                userId: user._id,
                language,
            });

            if (response.data.method === "email") {
                setOtpMethod("email");
                setMessage(t("language.otpSentEmail"));
                setShowOtp(true);
                return;
            }

            if (response.data.method === "phone") {
                setOtpMethod("phone");
                setMessage(t("language.otpSentMobile"));
                setShowOtp(true);
                return;
            }

            setMessage(t("language.invalidMethod"));
        } catch (error: any) {
            console.error("Language change error:", error.response?.data,
                error.response?.status
            );
            setMessage(
                error.response?.data?.message || t("language.requestFailed")
            );
        } finally {
            setOtpLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            setMessage(t("language.invalidOtpLength"));
            return;
        }

        if (!user?._id) {
            setMessage(t("language.userUnavailable"));
            return;
        }

        if (!selectedLanguage) {
            setMessage(t("language.missingLanguage"));
            return;
        }

        try {
            setOtpLoading(true);

            const response =
                otpMethod === "phone"
                    ? await axios.post(`${API}/verify-phone`, {
                          userId: user._id,
                          otp,
                          language: selectedLanguage,
                      })
                    : await axios.post(`${API}/verift-otp`, {
                          userId: user._id,
                          otp,
                      });

            if (response.data.success) {
                await applyLanguage(
                    response.data.language || selectedLanguage
                );
                resetDialog();
            } else {
                setMessage(
                    response.data.message || t("language.verifyFailed")
                );
            }
        } catch (error: any) {
            console.error("OTP verification error:", error);
            setMessage(
                error.response?.data?.message || t("language.verifyFailed")
            );
        } finally {
            setOtpLoading(false);
        }
    };

    const closeOtpDialog = () => {
        if (otpLoading) return;
        resetDialog();
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
                            {t("language.title")}
                        </DropdownMenuLabel>

                        <DropdownMenuRadioGroup
                            value={appLanguage}
                            onValueChange={handleLanguageChange}
                        >
                            {LANGUAGES.map((l) => (
                                <DropdownMenuRadioItem
                                    key={l.code}
                                    value={l.code}
                                >
                                    {l.label}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog
                open={showOtp}
                onOpenChange={(open) => {
                    if (!open) closeOtpDialog();
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {t("language.verifyLanguage")}
                        </DialogTitle>

                        <DialogDescription>{message}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder={t("language.enterOtp")}
                            value={otp}
                            maxLength={6}
                            onChange={(e) =>
                                setOtp(e.target.value.replace(/\D/g, ""))
                            }
                        />

                        <Button
                            className="w-full"
                            disabled={otpLoading || otp.length !== 6}
                            onClick={verifyOtp}
                        >
                            {otpLoading
                                ? t("common.loading")
                                : t("language.verify")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}