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
import axiosInstance from '@/lib/axiosInstance'

interface Tweet {
    id: string
    author: {
        id: string
        username: string
        displayName: string
        avatar: string
        verified?: boolean
    }
    content: string
    timestamp: string
    likes: number
    retweets: number
    comments: number
    liked?: boolean
    retweeted?: boolean
    image?: string
}

const tweets: Tweet[] = [
    {
        id: "1",
        author: {
            id: "1",
            username: "elonmusk",
            displayName: "Elon Musk",
            avatar:
                "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400",
            verified: true,
        },
        content:
            "Just had an amazing conversation about the future of AI. The possibilities are endless!",
        timestamp: "2h",
        likes: 1247,
        retweets: 324,
        comments: 89,
        liked: false,
        retweeted: false,
    },
    {
        id: "2",
        author: {
            id: "1",
            username: "sarahtech",
            displayName: "Sarah Johnson",
            avatar:
                "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400",
            verified: false,
        },
        content:
            "Working on some exciting new features for our app. Can't wait to share what we've been building! 🚀",
        timestamp: "4h",
        likes: 89,
        retweets: 23,
        comments: 12,
        liked: true,
        retweeted: false,
    },
    {
        id: "3",
        author: {
            id: "4",
            username: "designguru",
            displayName: "Alex Chen",
            avatar:
                "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400",
            verified: true,
        },
        content:
            "The new design system is finally complete! It took 6 months but the results are incredible. Clean, consistent, and accessible.",
        timestamp: "6h",
        likes: 456,
        retweets: 78,
        comments: 34,
        liked: false,
        retweeted: true,
        image:
            "https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
]

const ProfilePgae = () => {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState("posts")
    const [showEditModal, setShowEditModal] = useState(false)

    if (!user) return null
    const [tweets, setTweets] = useState<any>([]);
    const [loading, setLoading] = useState(false);

    const fetchTweets = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/post");
            setTweets(response.data);
        } catch (error) {
            console.log
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTweets()
    }, [])

    const userTweets = tweets.filter(
        (tweet: any) => tweet.author._id === user._id
    )

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-gray-800 z-10">
                <div className="flex items-center px-4 py-3 space-x-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 rounded-full hover:bg-gray-900"
                    >
                        <ArrowLeft className="h-5 w-5 text-white" />
                    </Button>

                    <div>
                        <h1 className="text-xl font-bold text-white">
                            {user.displayName}
                        </h1>
                        <p className="text-sm text-gray-400">
                            {userTweets.length} posts
                        </p>
                    </div>
                </div>
            </div>

            {/* Cover Photo */}
            <div className="relative">
                <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70"
                    >
                        <Camera className="h-5 w-5 text-white" />
                    </Button>
                </div>

                {/* Profile Picture */}
                <div className="absolute -bottom-12 sm:-bottom-12 left-4 z-20">
                    <div className="relative group">
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
                                src={user.avatar}
                                alt={user.displayName}
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
                                {user.displayName?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        {/* Camera Button */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="
                absolute
                bottom-1
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
                    </div>
                </div>

                <div className="flex justify-end p-4">
                    <Button
                        variant="outline"
                        className="border-gray-600 text-white bg-gray-950 font-semibold rounded-full px-4 sm:px-6"
                        onClick={() => setShowEditModal(true)}
                    >
                        Edit profile
                    </Button>
                </div>

                {/* Profile Information */}
                <div className="px-4 pt-12 sm:pt-16 pb-5">
                    {/* Name + More Button */}
                    <div className="flex items-start justify-between">
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                                {user.displayName}
                            </h1>

                            <p className="text-sm text-gray-400 mt-1 truncate">
                                @{user.username}
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
                    {user.bio && (
                        <p className="text-white mt-4 mb-4 leading-relaxed break-words">
                            {user.bio}
                        </p>
                    )}

                    {/* Profile Metadata */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-400 text-sm">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>{user.location ? user.location : "Earth"}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <LinkIcon className="h-4 w-4 shrink-0" />
                            <span className="text-blue-400 truncate max-w-[160px]">
                                {user.website ? user.website : "www.example.com"}
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span>Joined {user.joinedDate && new Date(user.joinedDate).toLocaleDateString("en-us", { month: "long", year: "numeric" })}</span>
                        </div>
                    </div>
                </div>
            </div>

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
                            <Card className="bg-black border-none">
                                <CardContent className="py-12 text-center">
                                    <div className="text-gray-400">
                                        <h3 className="text-2xl font-bold mb-2">
                                            You haven't posted yet
                                        </h3>

                                        <p>
                                            When you post, it will show up here.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            userTweets.map((tweet: any) => (
                                <TweetCard
                                    key={tweet._id}
                                    tweet={tweet}
                                />
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
                                    You haven't replied yet
                                </h3>

                                <p>
                                    When you reply to a post, it will show up here.
                                </p>
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
                                    When you post photos or videos, they will show up here.
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
                                    You haven't written any articles
                                </h3>

                                <p>
                                    When you write articles, they will show up here.
                                </p>
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
                                    When you post photos or videos, they will show up here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <EditProfile
                isopen={showEditModal}
                onclose={() => setShowEditModal(false)}
            />
        </div >
    )
}

export default ProfilePgae