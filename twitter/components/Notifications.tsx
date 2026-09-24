"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface NotificationItem {
    _id: string;
    message: string;
    keyword: string;
    isRead: boolean;
    createdAt: string;
    tweetId?: {
        _id: string;
    };
}

const Notifications = ({
    userId
}: {
    userId: string
}) => {

    const [notifications, setNotifications] =
        useState<NotificationItem[]>([]);

    const [loading, setLoading] =
        useState(true);


    const loadNotifications = async () => {

        try {

            const response = await axios.get(
                `http://localhost:5000/notifications/${userId}`
            );

            setNotifications(
                response.data.notifications || []
            );

        } catch (error) {

            console.error(
                "Notification fetch error:",
                error
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        if (!userId) return;

        loadNotifications();

    }, [userId]);


    if (loading) {
        return (
            <div className="p-5 text-gray-400">
                Loading notifications...
            </div>
        );
    }


    return (
        <div className="w-full">

            <div className="border-b border-gray-800 p-5">

                <h1 className="text-xl font-bold text-white">
                    Notifications
                </h1>

            </div>


            {notifications.length === 0 ? (

                <div className="p-8 text-center">

                    <p className="text-gray-400">
                        No notifications yet.
                    </p>

                </div>

            ) : (

                notifications.map(notification => (

                    <div
                        key={notification._id}
                        className={`
                            border-b
                            border-gray-800
                            p-5
                            hover:bg-gray-950
                            transition
                            ${!notification.isRead
                                ? "bg-[#111820]"
                                : ""
                            }
                        `}
                    >

                        <div className="flex gap-3">

                            <div className="text-xl">
                                🔔
                            </div>


                            <div className="flex-1">

                                <p className="text-white">

                                    New tweet contains{" "}

                                    <span className="text-blue-400 font-semibold">
                                        {notification.keyword}
                                    </span>

                                </p>


                                <p className="mt-2 text-gray-300">

                                    {notification.message}

                                </p>


                                <p className="mt-2 text-xs text-gray-500">

                                    {new Date(
                                        notification.createdAt
                                    ).toLocaleString()}

                                </p>

                            </div>

                        </div>

                    </div>

                ))

            )}

        </div>
    );
};

export default Notifications;