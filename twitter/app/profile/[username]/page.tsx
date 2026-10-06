"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import FollowButton from "@/components/FollowButton";
import FollowList from "@/components/FollowList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfilePage = () => {

    const { username } = useParams<{ username: string }>();
    const { user } = useAuth();

    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ followersCount: 0, followingCount: 0, isFollowing: false });
    const [tab, setTab] = useState<"followers" | "following" | null>(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const p = await axiosInstance.get(`/user/${username}`);
                setProfile(p.data.user);

                const s = await axiosInstance.get(`/api/follow/${p.data.user._id}/stats`, { params: { viewerId: user?._id } });
                setStats(s.data);
            } catch (error) {
                console.log(error);
                setNotFound(true);
            }
        }

        if (username) load();
    }, [username, user?._id]);

    if (notFound) return <div className="p-6 text-white">User not found</div>;
    if (!profile) return <div className="p-6 text-gray-400">Loading...</div>;

    return (
        <div className="text-white">
            <div className="p-4 border-b border-gray-800">
                <div className="flex items-start justify-between">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={profile.avatar} alt={profile.displayName} />
                        <AvatarFallback>{profile.displayName[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <FollowButton
                        targetUserId = {profile._id}
                        initalIsFollowing={stats.isFollowing}
                        onChange={(isFollowing, followersCount)=>setStats((prev)=>({
                            ...prev,
                            isFollowing,
                            followersCount:followersCount ?? prev.followersCount,
                        }))}
                    />
                </div>

                <h1 className="text-xl font-bold mt-3">{profile.displayName}</h1>
                <p className="text-gray-500">{profile.username}</p>
                {profile.bio && <p className="mt-2">{profile.bio}</p>}
                
                <div className="flex gap-5 mt-3 text-sm">
                    <button onClick={()=> setTab("following")} className="hover:underline"><b>{stats.followingCount}</b> <span className="text-gray-500">Following</span></button>

                    <button onClick={()=> setTab("followers")} className="hover:underline"><b>{stats.followersCount}</b> <span className="text-gray-500">Following</span></button>
                </div>
            </div>

            {tab &&(
                <div>
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
                        <span className="font-semibold capitalize">{tab}</span>
                        <button className="text-gray-400 text-sm" onClick={()=>setTab(null)}>Close</button>
                    </div>
                    <FollowList userId={profile._id} type={tab}/>
                </div>
            )}
        </div>
    )

}

export default ProfilePage;