
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "./ui/button";

interface FollowButtonProps {
    targetUserId: string;
    initialIsFollowing?: boolean;
    onChange?: (
        isFollowing: boolean,
        followersCount?: number
    ) => void;
}

interface FollowResponse {
    success: boolean;
    isFollowing: boolean;
    followersCount: number;
    followingCount: number;
    message?: string;
}

const FollowButton = ({
    targetUserId,
    initialIsFollowing = false,
    onChange,
}: FollowButtonProps) => {
    const { user } = useAuth();

    const [isFollowing, setIsFollowing] = useState(
        initialIsFollowing
    );
    const [loading, setLoading] = useState(false);
    const [hover, setHover] = useState(false);

    useEffect(() => {
        setIsFollowing(initialIsFollowing);
    }, [initialIsFollowing]);

    if (!user || !targetUserId || user._id === targetUserId) {
        return null;
    }

    const toggleFollow = async (
        e: React.MouseEvent<HTMLButtonElement>
    ) => {
        e.stopPropagation();

        if (loading) return;

        const previousState = isFollowing;
        const nextState = !previousState;

        setIsFollowing(nextState);
        setLoading(true);

        try {
            const endpoint = nextState
                ? `/api/follow/${targetUserId}`
                : `/api/follow/${targetUserId}/unfollow`;

            const response = await axiosInstance.post<FollowResponse>(
                endpoint,
                {
                    userId: user._id,
                }
            );

            const data = response.data;

            setIsFollowing(data.isFollowing);

            onChange?.(
                data.isFollowing,
                data.followersCount
            );
        } catch (error: any) {
            setIsFollowing(previousState);

            console.error("Follow request failed:", {
                status: error.response?.status,
                message: error.response?.data?.message,
                response: error.response?.data,
                targetUserId,
                currentUserId: user?._id,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            type="button"
            onClick={toggleFollow}
            disabled={loading}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            aria-label={isFollowing ? "Unfollow user" : "Follow user"}
            className={
                isFollowing
                    ? "h-9 rounded-full border border-gray-600 bg-transparent px-4 font-semibold text-white hover:border-red-600 hover:bg-red-950/20 hover:text-red-500"
                    : "h-9 rounded-full bg-white px-4 font-semibold text-black hover:bg-gray-200"
            }
        >
            {loading
                ? "Please wait..."
                : isFollowing
                    ? hover
                        ? "Unfollow"
                        : "Following"
                    : "Follow"}
        </Button>
    );
};

export default FollowButton;
