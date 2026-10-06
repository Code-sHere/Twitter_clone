import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from './ui/button'
import {
    ArrowLeft,
    Calendar,
    Camera,
    LinkIcon,
    MapPin,
    MoreHorizontal
} from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent } from './ui/card'
import TweetCard from './TweetCard'
import EditProfile from './EditProfile'
import FollowButton from "./FollowButton";
import FollowList from "./FollowList";
import axiosInstance from '@/lib/axiosInstance'
import NotificationSetings from './NotificationSetings'
import { useTranslation } from 'react-i18next'


interface ProfilePageProps {
    username?: string
    onBack?: () => void
}

const ProfilePgae = ({ username, onBack }: ProfilePageProps) => {
    const { user } = useAuth()

    // when the state = null then it's show own profile
    const [viewedUsername, setViewedUsername] = useState<string | null>(
        username ?? null
    );

    // perviously opened profiles, so the back arrow works
    const [history, setHistory] = useState<(string | null)[]>([]);

    // "posts" = normal profile, otherwise the followers / following screen
    const [view, setView] = useState<"posts" | "followers" | "following">("posts");

    const [otherProfile, setOtherProfile] = useState<any>(null);
    const [notFound, setNotFound] = useState(false);

    const [stats, setStats] = useState({
        followersCount: 0,
        followingCount: 0,
        isFollowing: false,
    });


    const [activeTab, setActiveTab] = useState("posts")
    const [showEditModal, setShowEditModal] = useState(false)

    if (!user) return null
    const [tweets, setTweets] = useState<any>([]);
    const [loading, setLoading] = useState(false);

    const isOwnProfile = !viewedUsername || viewedUsername === user.username;
    const profile: any = isOwnProfile ? user : otherProfile;
    const profileId: string | undefined = profile?._id;

    const { t } = useTranslation();

    // when the parent passes a different username (for example from a tweet click)
    useEffect(() => {
        setViewedUsername(username ?? null);
        setHistory([]);
        setView("posts");
        setActiveTab("posts");
    }, [username]);

    // load another user's profile
    useEffect(() => {
        if (isOwnProfile || !viewedUsername) {
            setOtherProfile(null);
            setNotFound(false);
            return;
        }

        let cancelled = false;
        setOtherProfile(null);
        setNotFound(false);

        axiosInstance.get(`/user/${viewedUsername}`)
            .then((res) => {
                if (cancelled) return;
                setOtherProfile(res.data.user);
            })
            .catch((e) => {
                console.log(e);
                if (!cancelled) setNotFound(true);
            })

        return () => {
            cancelled = true
        }
    }, [viewedUsername, isOwnProfile]);

    //  load follow stats + this user's tweets
    useEffect(() => {
        if (!profileId || !user) return;

        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);

                const [statsRes, tweetsRes] = await Promise.all([
                    axiosInstance.get(`/api/follow/${profileId}/stats`, {
                        params: { viewerId: user._id },
                    }),
                    axiosInstance.get("/post", {
                        params: { authorId: profileId },
                    }),
                ]);

                if (cancelled) return;
                setStats(statsRes.data);
                setTweets(tweetsRes.data);
            } catch (error) {
                console.error("Load profile data failed:", error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [profileId, user?._id]);

    const userTweets = tweets.filter(
        (tweet: any) => tweet.author._id === user._id
    )

    // open another user's profile (used by the followers / following lists)
    const openProfile = (name: string) => {
        if (name === viewedUsername) {
            setView("posts");
            return;
        }
        setHistory((prev) => [...prev, viewedUsername]);
        setViewedUsername(name);
        setView("posts");
        setActiveTab("posts");
    };

    const handleBack = () => {
        if (view !== "posts") {
            setView("posts")
            return;
        }

        if (history.length > 0) {
            const previous = history[history.length - 1]
            setHistory(history.slice(0, -1))
            setViewedUsername(previous)
            setActiveTab("posts")
            return;
        }

        onBack?.()
    }

    if (!user) return null;

    if (notFound) {
        return (
            <div className="min-h-screen">
                <div className="flex items-center px-4 py-3 space-x-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="p-2 rounded-full hover:bg-gray-900"
                    >
                        <ArrowLeft className="h-5 w-5 text-white" />
                    </Button>
                    <h1 className="text-xl font-bold text-white">Profile</h1>
                </div>
                <div className="py-16 text-center text-gray-400">
                    <h3 className="text-2xl font-bold mb-2 text-white">
                        This account doesn't exist
                    </h3>
                    <p>Try searching for another.</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return <div className="p-6 text-center text-gray-400">Loading...</div>;
    }

    if (view !== "posts") {
        return (
            <div className="min-h-screen">
                <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-gray-800 z-10">
                    <div className="flex items-center px-4 py-3 space-x-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="p-2 rounded-full hover:bg-gray-900"
                        >
                            <ArrowLeft className="h-5 w-5 text-white" />
                        </Button>

                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-white truncate">
                                {profile.displayName}
                            </h1>
                            <p className="text-sm text-gray-400 truncate">
                                @{profile.username}
                            </p>
                        </div>
                    </div>

                    <div className="flex">
                        {(["followers", "following"] as const).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setView(tab)}
                                className="relative flex-1 py-3 hover:bg-gray-900/50 capitalize"
                            >
                                <span
                                    className={
                                        view === tab
                                            ? "font-bold text-white"
                                            : "font-semibold text-gray-500"
                                    }
                                >
                                    {tab}
                                </span>

                                {view === tab && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-14 rounded-full bg-blue-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <FollowList
                    key={`${profile._id}-${view}`}
                    userId={profile._id}
                    type={view}
                    onSelectUser={openProfile}
                />
            </div>
        );
    }


    // normal profile
    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-gray-800 z-10">
                <div className="flex items-center px-4 py-3 space-x-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="p-2 rounded-full hover:bg-gray-900"
                    >
                        <ArrowLeft className="h-5 w-5 text-white" />
                    </Button>

                    <div>
                        <h1 className="text-xl font-bold text-white">
                            {profile.displayName}
                        </h1>
                        <p className="text-sm text-gray-400">
                            {t("profile.posts", { count: userTweets.length })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Cover Photo */}
            <div className="relative w-full">
                <div className="h-32 sm:h-48 w-full bg-gradient-to-r from-blue-600 to-purple-600 relative">
                    {isOwnProfile && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70"
                        >
                            <Camera className="h-5 w-5 text-white" />
                        </Button>
                    )}
                </div>

                {/* Profile Picture */}
                <div className="absolute top-40 sm:bottom-40 left-4 sm:left-5 z-10">
                    {/* Avatar */}
                    <Avatar
                        className="
                h-20 w-20 sm:h-24 sm:w-24
                rounded-full
                border-[4px] border-black
                bg-black
                overflow-hidden
                shadow-lg
                ring-0
                focus:outline-none
            ">
                        <AvatarImage
                            src={profile.avatar}
                            alt={profile.displayName}
                            className="h-full w-full object-cover"
                        />

                        <AvatarFallback
                            className="h-full w-full
                    rounded-full
                    bg-gray-800
                    text-white
                    text-xl sm:text-3xl
                    font-bold
                    flex items-center justify-center
                "
                        >
                            {profile.displayName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {/* Camera Button */}
                    {isOwnProfile && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="
                absolute
                top-15
                right-1
                h-8 sm:h-9
                w-8 sm:w-9
                rounded-full
                bg-black/80
                border
                border-white/30
                text-white
                shadow-md
                hover:bg-black
                hover:border-white/50
                transition-all
                duration-200
                focus-visible:ring-2
                focus-visible:ring-white/60
                focus-visible:ring-offset-0
            "
                        >
                            <Camera className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Edit Profile (own) or Follow (other users) */}
                <div className="flex justify-end p-4">
                    {isOwnProfile ? (
                        <Button
                            variant="outline"
                            className="border-gray-600 text-white bg-gray-950 font-semibold rounded-full px-4 sm:px-6"
                            onClick={() => setShowEditModal(true)}
                        >
                            {t("profile.editProfile")}
                        </Button>
                    ) : (
                        <FollowButton
                            targetUserId={profile._id}
                            initialIsFollowing={stats.isFollowing}
                            onChange={(isFollowing, followersCount) =>
                                setStats((prev) => ({
                                    ...prev,
                                    isFollowing,
                                    followersCount:
                                        followersCount ?? prev.followersCount,
                                }))
                            }
                        />
                    )}
                </div>

                {/* Profile Information */}
                <div className="px-4 pt-12 sm:pt-16 pb-5">
                    {/* Name + More Button */}
                    <div className="flex items-start justify-between">
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                                {profile.displayName}
                            </h1>

                            <p className="text-sm text-gray-400 mt-1 truncate">
                                @{profile.username}
                            </p>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 rounded-full hover:bg-gray-900 shrink-0"
                        >
                            <MoreHorizontal className="h-5 w-5 text-gray-400" />
                        </Button>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <p className="text-white mt-4 mb-4 leading-relaxed break-words">
                            {profile.bio}
                        </p>
                    )}

                    {/* Profile Metadata */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-400 text-sm">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>{profile.location ? profile.location : "Earth"}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <LinkIcon className="h-4 w-4 shrink-0" />
                            <span className="text-blue-400 truncate max-w-[160px]">
                                {profile.website ? profile.website : "www.example.com"}
                            </span>
                        </div>

                        {profile.joinedDate && (
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 shrink-0" />
                                <span>
                                    Joined{" "}
                                    {new Date(profile.joinedDate).toLocaleDateString(
                                        "en-us",
                                        { month: "long", year: "numeric" }
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                    {/* Following / Followers counts */}
                    <div className="flex gap-5 mt-3 text-sm">
                        <button
                            type="button"
                            onClick={() => setView("following")}
                            className="hover:underline"
                        >
                            <b className="text-white">{stats.followingCount}</b>{" "}
                            <span className="text-gray-500">Following</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setView("followers")}
                            className="hover:underline"
                        >
                            <b className="text-white">{stats.followersCount}</b>{" "}
                            <span className="text-gray-500">Followers</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification settings: only on my own profile */}
            {isOwnProfile && (
                <div className="px-4 py-4 border-b border-gray-800">
                    <NotificationSetings userId={user._id} />
                </div>
            )}

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="flex w-full overflow-x-auto no-scrollbar bg-transparent border-b border-gray-800 rounded-none h-auto justify-start">
                    {["posts", "replies", "highlights", "articles", "media"].map((tab) => (
                        <TabsTrigger
                            key={tab}
                            value={tab}
                            className="shrink-0 whitespace-nowrap data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none text-gray-400 hover:bg-gray-900/50 px-4 py-3 sm:py-4 text-sm sm:text-base font-semibold"
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Posts */}
                <TabsContent value="posts" className="mt-0">
                    <div className="divide-y divide-gray-800">
                        {loading ? (
                            <p className="py-12 text-center text-gray-400">
                                Loading...
                            </p>
                        ) : tweets.length === 0 ? (
                            <Card className="bg-black border-none">
                                <CardContent className="py-12 text-center">
                                    <div className="text-gray-400">
                                        <h3 className="text-2xl font-bold mb-2">
                                            {isOwnProfile
                                                ? "You haven't posted yet"
                                                : `@${profile.username} hasn't posted yet`}
                                        </h3>

                                        <p>
                                            {isOwnProfile
                                                ? "When you post, it will show up here."
                                                : "When they post, it will show up here."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            tweets.map((tweet: any) => (
                                <TweetCard key={tweet._id} tweet={tweet} />
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* Replies */}
                <TabsContent value="replies" className="mt-0">
                    <Card className="bg-black border-none">
                        <CardContent className="py-12 text-center">
                            <div className="text-gray-400">
                                <h3 className="text-2xl font-bold mb-2">
                                    {isOwnProfile
                                        ? "You haven't replied yet"
                                        : "No replies yet"}
                                </h3>

                                <p>When a reply is posted, it will show up here.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Highlights */}
                <TabsContent value="highlights" className="mt-0">
                    <Card className="bg-black border-none">
                        <CardContent className="py-12 text-center">
                            <div className="text-gray-400">
                                <h3 className="text-2xl font-bold mb-2">
                                    Lights, camera … attachments!
                                </h3>

                                <p>
                                    When photos or videos are posted, they will show up
                                    here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Articles */}
                <TabsContent value="articles" className="mt-0">
                    <Card className="bg-black border-none">
                        <CardContent className="py-12 text-center">
                            <div className="text-gray-400">
                                <h3 className="text-2xl font-bold mb-2">
                                    No articles yet
                                </h3>

                                <p>When articles are written, they will show up here.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Media */}
                <TabsContent value="media" className="mt-0">
                    <Card className="bg-black border-none">
                        <CardContent className="py-12 text-center">
                            <div className="text-gray-400">
                                <h3 className="text-2xl font-bold mb-2">
                                    Lights, camera … attachments!
                                </h3>

                                <p>
                                    When photos or videos are posted, they will show up
                                    here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {isOwnProfile && (
                <EditProfile
                    isopen={showEditModal}
                    onclose={() => setShowEditModal(false)}
                />
            )}
        </div >
    )
}

export default ProfilePgae