"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";

interface FollowButtonProps {
    targetUserId: string;
    initialIsFollowing: boolean;
    onChange?: (isFollowing: boolean, followersCount?: number) => void;
}

const FollowButton = ({
    targetUserId,
    initialIsFollowing = false,
    onChange,
}: FollowButtonProps) => {

    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [loading, setLoading] = useState(false);
    const [hover, setHover] = useState(false);

    useEffect(() => setIsFollowing(initialIsFollowing), [initialIsFollowing]);

    // hide on your own profile or when logged out
    if (!user || user._id === targetUserId) return null;

    const toggle = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (loading) return;

        const next = !isFollowing;

        setIsFollowing(next);
        setLoading(true);

        try {
            const res = await axiosInstance.post(`/api/follow/${targetUserId}${next ? "" : "/unfollow"}`, { userID: user._id });
        } catch (error) {
            setIsFollowing(!next);
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            type="button"
            onClick={toggle}
            disabled={loading}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className={
                isFollowing
                    ? "rounded-full px-4 h-9 font-semibold bg-transparent border border-gray-600 text-white hover:border-red-600 hover:text-red-500 hover:bg-red-950/20"
                    : "rounded-full px-4 h-9 font-semibold bg-white text-black hover:bg-gray-200"
            }
        >
            {isFollowing ? (hover ? "Unfollow" : "Following") : "Follow"}
        </Button>
    );
}

export default FollowButton;