"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import FollowButton from "./FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

type FollowUser = {
    _id: string;
    username?: string;
    displayName?: string;
    avatar?: string;
    bio?: string;
    isFollowing?: boolean;
};

const FollowList = ({
    userId,
    type,
    onSelectUser,
}: {
    userId: string;
    type: "followers" | "following";
    onSelectUser?: (username: string) => void;
}) => {

    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const [users, setUsers] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);

    const load = async (pageToLoad: number) => {

        try {
            setLoading(true);
            const res = await axiosInstance.get(`/api/follow/${userId}/${type}`, {
                params: { viewerId: user?._id, page: pageToLoad, limit: 20 },
            });
            setUsers((prev) => pageToLoad === 1 ? res.data.users : [...prev, ...res.data.users]
            );

            setHasMore(res.data.hasMore);
            setPage(pageToLoad);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(!user?._id) return;

        load(1);
    }, [userId, type, user?._id]);

    if (!loading && users.length === 0) {
        return <p className="p-6 text-center text-gray-500">No user Yet.</p>
    }

    return (
        <div>
            {users.map((u) => (
                <div key={u._id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
                    <Avatar className="h-11 w-11 shrink-0">
                        <AvatarImage src={u.avatar} alt={u.displayName} />
                        <AvatarFallback>{u.displayName?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <button type="button" onClick={()=>onSelectUser?.(u.username)} className="flex-1 min-w-0 text-left">
                        <p className="font-bold text-white truncate">{u.displayName}</p>
                        <p className="text-gray-500 truncate">@{u.username}</p>
                        {u.bio && <p className="text-gray-300 text-sm truncate">{u.bio}</p>}
                    </button>

                    <FollowButton targetUserId={u._id} initialIsFollowing={u.isFollowing} />

                </div>
            ))}
            {loading && <p className="p-4 text-center text-gray-500">Loading...</p>}

            {hasMore && !loading && (
                <div className="p-4 text-center">
                    <Button variant="ghost" onClick={() => load(page + 1)}>
                        Load more
                    </Button>
                </div>
            )}
        </div>
    );
};

export default FollowList;
