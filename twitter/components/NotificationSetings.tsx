"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const NotificationSetings = ({ userId }: { userId: string }) => {
    const [enabled, setEnabled] = useState(true);
    const [loading, setLoading] = useState(false);

    const { t } = useTranslation();
    const API = process.env.NEXT_PUBLIC_BACKEND_URL;

    useEffect(() => {
        if (!userId) return;

        const loadNotificationSettings = async () => {
            setLoading(true);

            try {
                const response = await axios.get(
                    `${API}/settings/${userId}`
                );

                setEnabled(response.data.notificationEnabled);
            } catch (error) {
                console.log("Notification settings error", error);
            } finally {
                setLoading(false);
            }
        };

        void loadNotificationSettings();
    }, [userId, API]);

    const handleToggle = async () => {
        const newValue = !enabled;

        try {
            if (
                newValue &&
                "Notification" in window &&
                Notification.permission !== "granted"
            ) {
                const permission = await Notification.requestPermission();

                if (permission !== "granted") {
                    alert("Please allow notifications in your browser.");
                    return;
                }
            }

            await axios.put(`${API}/settings/${userId}`, {
                notificationEnabled: newValue,
            });

            setEnabled(newValue);
        } catch (error) {
            console.log("Notification settings error", error);
        }
    };

    if (loading) {
        return (
            <div className="w-full rounded-xl border border-gray-800 bg-[#16181c] p-4 text-sm text-gray-400 sm:p-5">
                Loading notification settings...
            </div>
        );
    }

    return (
        <section className="w-full min-w-0 rounded-xl border border-gray-800 bg-[#16181c] p-4 sm:rounded-2xl sm:p-5 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div className="min-w-0 flex-1">
                    <h3 className="break-words text-base font-semibold text-white sm:text-lg">
                        {t("notificationSettings.tweetNotifications")}
                    </h3>

                    <p className="mt-1.5 break-words text-sm leading-relaxed text-gray-400">
                        Get browser notifications for tweets containing
                        "cricket" or "science".
                    </p>
                </div>

                <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label="Toggle tweet notifications"
                    onClick={handleToggle}
                    className={`relative inline-flex h-7 w-14 shrink-0 self-start items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#16181c] sm:self-center ${
                        enabled ? "bg-blue-500" : "bg-gray-700"
                    }`}
                >
                    <span
                        className={`absolute left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
                            enabled ? "translate-x-7" : "translate-x-0"
                        }`}
                    />
                </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-800 pt-3 text-sm sm:mt-5 sm:pt-4">
                <span className="text-gray-400">Status:</span>

                <span
                    className={
                        enabled ? "font-medium text-green-400" : "font-medium text-red-400"
                    }
                >
                    {enabled ? "Enabled" : "Disabled"}
                </span>
            </div>
        </section>
    );
};

export default NotificationSetings;