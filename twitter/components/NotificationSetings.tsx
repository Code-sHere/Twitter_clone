import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';

const NotificationSetings = ({ userId }) => {

    const [enabled, setEnabled] = useState(true);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        loadNotificationSettings();
    }, [userId]);


    const loadNotificationSettings = async () => {

        try {

            const response = await axios.get(`/setting/${userId}`);

            setEnabled(response.data.notificationEnalbed);

        } catch (error) {

            console.log("Notification settings error", error);

        } finally {
            setLoading(false);
        }
    }

    const handleToggle = async () => {
        const newValue = !enabled;

        try {
            // ask broweser permisssion to user 

            if (newValue && "Notification" in window && Notification.permission !== "granted") {
                const permission = await Notification.requestPermission();

                if (permission === "granted") {
                    alert("Notifications are enabled");
                    return;
                }
            }

            await axios.put(`/setting/${userId}`, { notificationEnalbed: newValue });
            setEnabled(newValue);
        } catch (error) {
            console.log("Notification settings error", error);
        }

    }

    if (loading) {
        return (
            <div className="text-gray-400">
                Loading notification settings...
            </div>
        );
    }

    return (
        <>
            <div className="rounded-2xl border border-gray-800 bg-[#16181c] p-5">

                <div className="flex items-center justify-between">

                    <div>

                        <h3 className="text-white font-semibold">
                            Tweet Notifications
                        </h3>

                        <p className="text-sm text-gray-400 mt-1">
                            Get browser notifications for tweets
                            containing "cricket" or "science".
                        </p>

                    </div>


                    <button
                        onClick={handleToggle}
                        className={`
                        relative
                        w-14
                        h-7
                        rounded-full
                        transition
                        duration-300
                        ${enabled
                                ? "bg-blue-500"
                                : "bg-gray-700"
                            }
                    `}
                    >

                        <span
                            className={`
                            absolute
                            top-1
                            w-5
                            h-5
                            rounded-full
                            bg-white
                            transition
                            duration-300
                            ${enabled
                                    ? "left-8"
                                    : "left-1"
                                }
                        `}
                        />

                    </button>

                </div>


                <div className="mt-4 text-sm">

                    <span className="text-gray-400">
                        Status:
                    </span>

                    <span
                        className={
                            enabled
                                ? "ml-2 text-green-400"
                                : "ml-2 text-red-400"
                        }
                    >
                        {enabled ? "Enabled" : "Disabled"}
                    </span>

                </div>

            </div>
        </>
    )
}

export default NotificationSetings
