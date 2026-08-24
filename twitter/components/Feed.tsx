"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";
import Loadingspinner from "./Loading-spinner";
import TweetCard from "./TweetCard";
import TweetComposer from "./TweetComposer";
import axiosInstance from "@/lib/axiosInstance";

interface Tweet {
    id: string;
    author: {
        id: string;
        username: string;
        displayName: string;
        avatar: string;
        verified?: boolean;
    };
    content: string;
    timestamp: string;
    likes: number;
    retweets: number;
    comments: number;
    liked?: boolean;
    retweeted?: boolean;
    image?: string;
}

const Feed = () => {
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTweets = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.get("/post");

            setTweets(response.data);
        } catch (error) {
            console.error("Failed to fetch tweets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTweets();
    }, []);

    const handleNewTweet = (newTweet: Tweet) => {
        setTweets((prev) => [newTweet, ...prev]);
    };

    return (
        <main className="min-h-screen w-full bg-black text-white overflow-x-hidden">
            {/* Header */}
            <div className="sticky top-0 z-30 w-full bg-black/90 backdrop-blur-md border-b border-gray-800">
                <div className="w-full max-w-2xl mx-auto">
                    <div className="px-3 sm:px-4 md:px-6 py-3">
                        <h1 className="text-lg sm:text-xl font-bold text-white">
                            Home
                        </h1>
                    </div>

                    <Tabs defaultValue="foryou" className="w-full">
                        <TabsList
                            className="
                                flex
                                w-full
                                h-auto
                                p-0
                                bg-transparent
                                rounded-none
                                border-b-0
                            "
                        >
                            <TabsTrigger
                                value="foryou"
                                className="
                                    flex-1
                                    min-w-0
                                    rounded-none
                                    bg-transparent
                                    text-gray-400
                                    hover:bg-gray-900
                                    hover:text-white
                                    py-3
                                    px-2
                                    sm:px-4
                                    text-sm
                                    sm:text-base
                                    font-semibold
                                    whitespace-nowrap
                                    data-[state=active]:bg-transparent
                                    data-[state=active]:text-white
                                    data-[state=active]:border-b-2
                                    data-[state=active]:border-blue-500
                                "
                            >
                                For You
                            </TabsTrigger>

                            <TabsTrigger
                                value="following"
                                className="
                                    flex-1
                                    min-w-0
                                    rounded-none
                                    bg-transparent
                                    text-gray-400
                                    hover:bg-gray-900
                                    hover:text-white
                                    py-3
                                    px-2
                                    sm:px-4
                                    text-sm
                                    sm:text-base
                                    font-semibold
                                    whitespace-nowrap
                                    data-[state=active]:bg-transparent
                                    data-[state=active]:text-white
                                    data-[state=active]:border-b-2
                                    data-[state=active]:border-blue-500
                                "
                            >
                                Following
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Composer */}
            <div className="w-full max-w-2xl mx-auto">
                <TweetComposer onTweetPosted={handleNewTweet} />
            </div>

            {/* Tweets */}
            <div className="w-full max-w-2xl mx-auto divide-y divide-gray-800">
                {loading ? (
                    <Card className="bg-black border-none rounded-none">
                        <CardContent className="py-12 px-4 text-center">
                            <div className="text-gray-400">
                                <Loadingspinner
                                    size="lg"
                                    className="mx-auto mb-4"
                                />

                                <p className="text-sm sm:text-base">
                                    Loading Tweets
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : tweets.length === 0 ? (
                    <Card className="bg-black border-none rounded-none">
                        <CardContent className="py-12 px-4 text-center">
                            <p className="text-gray-400 text-sm sm:text-base">
                                No tweets available.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    tweets.map((tweet) => (
                        <TweetCard
                            className="border-b border-gray-800"
                            key={tweet.id}
                            tweet={tweet}
                        />
                    ))
                )}
            </div>
        </main>
    );
};

export default Feed;