"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import FollowButton from "@/components/FollowButton";

interface FollowUser {
    _id: string;
    username: string;
    displayName?: string;
    avatar?: string;
    bio?: string;
    isFollowing: boolean;
}

interface FollowListProps {
    userId: string;
    type: "followers" | "following";
    onSelectUser?: (username: string) => void;
}

export default function FollowList({
    userId,
    type,
    onSelectUser,
}: FollowListProps) {
    const { user } = useAuth();
    const [users, setUsers] = useState<FollowUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadUsers = useCallback(async () => {
        if (!userId || !user?._id) {
            setUsers([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const endpoint = "/api/follow/" + userId + "/" + type;

            const response = await axiosInstance.get(endpoint, {
                params: {
                    viewerId: user._id,
                },
            });

            setUsers(response.data.users ?? []);
        } catch (err: any) {
            console.error("Failed to load follow list:", err.response?.data ?? err);

            setError(
                err.response?.data?.message ?? "Could not load users."
            );
        } finally {
            setLoading(false);
        }
    }, [userId, user?._id, type]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const updateFollowState = (
        targetUserId: string,
        isFollowing: boolean
    ) => {
        setUsers((current) =>
            current.map((person) =>
                person._id === targetUserId
                    ? { ...person, isFollowing }
                    : person
            )
        );
    };

    if (loading) {
        return (
            <p className="py-8 text-center text-gray-400">
                Loading users...
            </p>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-400">{error}</p>
                <button
                    onClick={loadUsers}
                    className="mt-3 rounded-full border border-gray-600 px-4 py-2"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <p className="py-10 text-center text-gray-500">
                {type === "following"
                    ? "Not following anyone yet."
                    : "No followers yet."}
            </p>
        );
    }

    return (
        <div>
            {users.map((person) => (
                <article
                    key={person._id}
                    className="flex items-center gap-3 border-b border-gray-800 px-4 py-4 hover:bg-white/[0.03]"
                >
                    <button
                        type="button"
                        onClick={() => onSelectUser?.(person.username)}
                        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-800 font-bold"
                    >
                        {person.avatar ? (
                            <img
                                src={person.avatar}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            (person.displayName || person.username)
                                .charAt(0)
                                .toUpperCase()
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectUser?.(person.username)}
                        className="min-w-0 flex-1 text-left"
                    >
                        <span className="block truncate font-bold">
                            {person.displayName || person.username}
                        </span>
                        <span className="block truncate text-sm text-gray-500">
                            @{person.username}
                        </span>
                        {person.bio && (
                            <span className="mt-1 block line-clamp-2 text-sm text-gray-300">
                                {person.bio}
                            </span>
                        )}
                    </button>

                    {person._id !== user?._id && (
                        <div className="shrink-0">
                            <FollowButton
                                targetUserId={person._id}
                                initialIsFollowing={person.isFollowing}
                                onFollowChange={(isFollowing) =>
                                    updateFollowState(person._id, isFollowing)
                                }
                            />
                        </div>
                    )}
                </article>
            ))}
        </div>
    );
}
