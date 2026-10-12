
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Search, Users, UserRound } from "lucide-react";
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

interface FollowPageProps {
    onOpenProfile?: (username: string) => void;
}

export default function FollowPage({
    onOpenProfile,
}: FollowPageProps) {
    const { user } = useAuth();

    const [query, setQuery] = useState("");
    const [users, setUsers] = useState<FollowUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadUsers = useCallback(async () => {
        if (!user?._id) return;

        setLoading(true);
        setError("");

        try {
            const response = query.trim()
                ? await axiosInstance.get("/api/follow/search", {
                    params: {
                        q: query.trim(),
                        viewerId: user._id,
                    },
                })
                : await axiosInstance.get("/api/follow/suggestions", {
                    params: {
                        viewerId: user._id,
                    },
                });

            setUsers(response.data.users ?? []);
        } catch (err: any) {
            console.error("Could not load users:", err);

            setError(
                err.response?.data?.message ??
                "Unable to load users. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [query, user?._id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadUsers();
        }, 300);

        return () => clearTimeout(timer);
    }, [loadUsers]);

    const updateFollowState = (
        targetUserId: string,
        isFollowing: boolean
    ) => {
        setUsers((current) =>
            current.map((item) =>
                item._id === targetUserId
                    ? { ...item, isFollowing }
                    : item
            )
        );
    };

    return (
        <section className="min-h-full bg-black text-white">
            <header className="sticky top-0 z-20 border-b border-gray-800 bg-black/90 px-4 py-4 backdrop-blur-md">
                <h1 className="text-xl font-bold">Follow people</h1>
                <p className="mt-1 text-sm text-gray-400">
                    Find people and build your community.
                </p>

                <div className="relative mt-4">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />

                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search people"
                        aria-label="Search people"
                        className="w-full rounded-full border border-gray-700 bg-[#16181c] py-3 pl-12 pr-4 text-sm outline-none transition focus:border-blue-500"
                    />
                </div>
            </header>

            <div className="border-b border-gray-800 px-4 py-4">
                <div className="flex items-center gap-2">
                    {query.trim() ? (
                        <Search className="h-5 w-5 text-blue-400" />
                    ) : (
                        <Users className="h-5 w-5 text-blue-400" />
                    )}

                    <h2 className="font-bold">
                        {query.trim() ? "Search results" : "Who to follow"}
                    </h2>
                </div>
            </div>

            {loading ? (
                <div className="py-12 text-center text-gray-400">
                    Loading people...
                </div>
            ) : error ? (
                <div className="px-4 py-10 text-center">
                    <p className="text-sm text-red-400">{error}</p>
                    <button
                        type="button"
                        onClick={loadUsers}
                        className="mt-3 rounded-full border border-gray-600 px-4 py-2 text-sm hover:bg-gray-900"
                    >
                        Try again
                    </button>
                </div>
            ) : users.length === 0 ? (
                <div className="px-6 py-14 text-center">
                    <UserRound className="mx-auto mb-3 h-10 w-10 text-gray-600" />
                    <h3 className="font-bold">
                        {query.trim() ? "No people found" : "No suggestions yet"}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                        {query.trim()
                            ? "Try another username or display name."
                            : "New people will appear here when available."}
                    </p>
                </div>
            ) : (
                <div>
                    {users.map((person) => (
                        <article
                            key={person._id}
                            className="flex items-start gap-3 border-b border-gray-800 px-4 py-4 transition hover:bg-white/[0.03]"
                        >
                            <button
                                type="button"
                                onClick={() => onOpenProfile?.(person.username)}
                                className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-800 font-bold"
                                aria-label={`Open ${person.username}'s profile`}
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

                            <div className="min-w-0 flex-1">
                                <button
                                    type="button"
                                    onClick={() => onOpenProfile?.(person.username)}
                                    className="block max-w-full truncate text-left font-bold hover:underline"
                                >
                                    {person.displayName || person.username}
                                </button>

                                <p className="truncate text-sm text-gray-500">
                                    @{person.username}
                                </p>

                                {person.bio && (
                                    <p className="mt-2 line-clamp-2 break-words text-sm text-gray-300">
                                        {person.bio}
                                    </p>
                                )}
                            </div>

                            <div className="shrink-0">
                                <FollowButton
                                    targetUserId={person._id}
                                    initialIsFollowing={person.isFollowing}
                                    onFollowChange={(isFollowing) => {
                                        // Update the user in your list after follow/unfollow
                                        setUsers((previousUsers) =>
                                            previousUsers.map((item) =>
                                                item._id === person._id
                                                    ? { ...item, isFollowing }
                                                    : item
                                            )
                                        );
                                    }}
                                />
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
