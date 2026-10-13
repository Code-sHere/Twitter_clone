"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "@/lib/axiosInstance";
import { useAuth } from "@/context/AuthContext";

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
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "fr", label: "Français" },
    { code: "es", label: "Español" },
    { code: "pt", label: "Português" },
    { code: "zh", label: "中文" },
] as const;

type OtpMethod = "email" | "phone" | "";

interface LanguageDropdownProps {
    userId?: string;
}

interface LanguageRequestResponse {
    success?: boolean;
    method?: OtpMethod;
    message?: string;
}

interface VerifyOtpResponse {
    success: boolean;
    language?: string;
    message?: string;
}

export default function LanguageDropdown({
    userId,
}: LanguageDropdownProps) {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();

    const currentUserId = userId || user?._id;
    const appLanguage = (
        i18n.resolvedLanguage ||
        i18n.language ||
        "en"
    ).split("-")[0];

    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [otp, setOtp] = useState("");
    const [otpMethod, setOtpMethod] = useState<OtpMethod>("");
    const [showOtp, setShowOtp] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<
        "error" | "success" | "info"
    >("info");

    const showMessage = (
        text: string,
        type: "error" | "success" | "info" = "info"
    ) => {
        setMessage(text);
        setMessageType(type);
    };

    const resetDialog = () => {
        setShowOtp(false);
        setOtp("");
        setOtpMethod("");
        setSelectedLanguage("");
        setMessage("");
        setMessageType("info");
    };

    const applyLanguage = async (language: string) => {
        await i18n.changeLanguage(language);

        try {
            localStorage.setItem("lang", language);
        } catch {
            // Language is already applied for this session.
        }
    };

    const handleLanguageChange = async (language: string) => {
        if (
            language === appLanguage ||
            otpLoading ||
            !LANGUAGES.some((item) => item.code === language)
        ) {
            return;
        }

        // English is applied directly, matching the existing behavior.
        if (language === "en") {
            try {
                await applyLanguage("en");
                showMessage("", "info");
            } catch (error) {
                console.error("Failed to change language:", error);
                showMessage(t("language.requestFailed"), "error");
            }
            return;
        }

        if (!currentUserId) {
            showMessage(t("language.userUnavailable"), "error");
            return;
        }

        try {
            setOtpLoading(true);
            setSelectedLanguage(language);
            setOtp("");
            showMessage("", "info");

            const { data } =
                await axiosInstance.post<LanguageRequestResponse>(
                    "/language/request",
                    {
                        userId: currentUserId,
                        language,
                    }
                );

            if (data.method !== "email" && data.method !== "phone") {
                showMessage(
                    data.message || t("language.invalidMethod"),
                    "error"
                );
                return;
            }

            setOtpMethod(data.method);
            setShowOtp(true);

            showMessage(
                data.method === "email"
                    ? t("language.otpSentEmail")
                    : t("language.otpSentMobile"),
                "success"
            );
        } catch (error: any) {
            console.error("API Error:", error);

            const errorMessage = error?.response?.data?.message;

            showMessage(
                errorMessage ||
                t("language.requestFailed"),
                "error"
            );
        } finally {
            setOtpLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (!/^\d{6}$/.test(otp)) {
            showMessage(t("language.invalidOtpLength"), "error");
            return;
        }

        if (!currentUserId || !selectedLanguage) {
            showMessage(t("language.missingLanguage"), "error");
            return;
        }

        if (!otpMethod) {
            showMessage(t("language.invalidMethod"), "error");
            return;
        }

        try {
            setOtpLoading(true);
            showMessage("", "info");

            const endpoint =
                otpMethod === "phone"
                    ? "/verify-phone"
                    : "/verift-otp";

            const payload =
                otpMethod === "phone"
                    ? {
                        userId: currentUserId,
                        otp,
                        language: selectedLanguage,
                    }
                    : {
                        userId: currentUserId,
                        otp,
                    };

            const { data } =
                await axiosInstance.post<VerifyOtpResponse>(
                    endpoint,
                    payload
                );

            if (!data.success) {
                showMessage(
                    data.message || t("language.verifyFailed"),
                    "error"
                );
                return;
            }

            const verifiedLanguage =
                data.language || selectedLanguage;

            if (
                !LANGUAGES.some(
                    (language) => language.code === verifiedLanguage
                )
            ) {
                showMessage(t("language.verifyFailed"), "error");
                return;
            }

            await applyLanguage(verifiedLanguage);
            resetDialog();
        } catch (error: any) {
            console.error("API Error:", error);

            const errorMessage = error?.response?.data?.message;

            showMessage(
                errorMessage ||
                t("language.requestFailed"),
                "error"
            );
        } finally {
            setOtpLoading(false);
        }
    };

    const closeOtpDialog = (open: boolean) => {
        if (!open && !otpLoading) {
            resetDialog();
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={otpLoading}
                        className="min-w-16 border-gray-300 bg-white px-4 text-black hover:bg-gray-100 hover:text-black"
                        aria-label={t("language.title")}
                    >
                        {appLanguage.toUpperCase()}
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    className="w-44"
                >
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>
                            {t("language.title")}
                        </DropdownMenuLabel>

                        <DropdownMenuRadioGroup
                            value={appLanguage}
                            onValueChange={handleLanguageChange}
                        >
                            {LANGUAGES.map(({ code, label }) => (
                                <DropdownMenuRadioItem
                                    key={code}
                                    value={code}
                                    disabled={otpLoading}
                                >
                                    {label}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog
                open={showOtp}
                onOpenChange={closeOtpDialog}
            >
                <DialogContent
                    className="w-[calc(100%-2rem)] max-w-md"
                >
                    <DialogHeader>
                        <DialogTitle>
                            {t("language.verifyLanguage")}
                        </DialogTitle>

                        <DialogDescription>
                            {message ||
                                (otpMethod === "phone"
                                    ? t("language.otpSentMobile")
                                    : t("language.otpSentEmail"))}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            void verifyOtp();
                        }}
                    >
                        <div className="space-y-2">
                            <Input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                placeholder={t("language.enterOtp")}
                                value={otp}
                                disabled={otpLoading}
                                aria-label={t("language.enterOtp")}
                                onChange={(event) => {
                                    setOtp(
                                        event.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 6)
                                    );
                                }}
                            />

                            {message && (
                                <p
                                    role="status"
                                    aria-live="polite"
                                    className={`text-sm ${messageType === "error"
                                        ? "text-red-500"
                                        : messageType === "success"
                                            ? "text-green-500"
                                            : "text-muted-foreground"
                                        }`}
                                >
                                    {message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={otpLoading || otp.length !== 6}
                        >
                            {otpLoading
                                ? t("common.loading")
                                : t("language.verify")}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}