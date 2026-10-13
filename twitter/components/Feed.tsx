"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";
import Loadingspinner from "./Loading-spinner";
import TweetCard from "./TweetCard";
import TweetComposer from "./TweetComposer";
import axiosInstance from "@/lib/axiosInstance";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

interface Author {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
    verified?: boolean;
}

interface Tweet {
    _id: string;
    author: Author;
    content: string;
    timestamp: string;
    likes: number;
    retweets: number;
    comments: number;
    likedBy?: string[];
    retweetedBy?: string[];
}

interface Asset {
    _id: string;
    author: string;
    assetsId: string;
    image?: string | null;
    audio?: string | null;
    timestamp: string;
}

interface CreatedTweetResponse {
    success: boolean;
    message: string;
    tweet: Tweet;
    asset?: Asset | null;
}

interface FeedProps {
    onOpenProfile?: (username: string) => void;
}

const Feed = ({ onOpenProfile }: FeedProps) => {
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("foryou");

    const { t } = useTranslation();
    const { user } = useAuth();

    const userId = user?._id;

    const fetchFeed = useCallback(async () => {
        setLoading(true);

        try {
            // Following feed requires a logged-in user.
            if (activeTab === "following" && !userId) {
                setTweets([]);
                setAssets([]);
                return;
            }

            const params =
                activeTab === "following"
                    ? { feedFor: userId }
                    : {};

            const tweetResponse = await axiosInstance.get("/post", {
                params,
            });

            const tweetData = tweetResponse.data;

            setTweets(
                Array.isArray(tweetData)
                    ? tweetData
                    : Array.isArray(tweetData?.tweets)
                        ? tweetData.tweets
                        : []
            );

            try {
                const assetResponse =
                    await axiosInstance.get("/assets");

                setAssets(
                    Array.isArray(assetResponse.data)
                        ? assetResponse.data
                        : []
                );
            } catch (assetError) {
                console.error("Failed to fetch assets:", assetError);
                setAssets([]);
            }
        } catch (error) {
            console.error("Failed to fetch feed:", error);
            setTweets([]);
            setAssets([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab, userId]);

    useEffect(() => {
        void fetchFeed();
    }, [fetchFeed]);

    const handleNewTweet = (response: CreatedTweetResponse) => {
        if (!response?.tweet) return;

        // Only add the new tweet directly to For You.
        if (activeTab === "foryou") {
            setTweets((previousTweets) => [
                response.tweet,
                ...previousTweets.filter(
                    (tweet) => tweet._id !== response.tweet._id
                ),
            ]);
        }

        if (response.asset) {
            setAssets((previousAssets) => [
                response.asset!,
                ...previousAssets.filter(
                    (asset) => asset._id !== response.asset!._id
                ),
            ]);
        }
    };

    return (
        <main className="min-h-screen w-full overflow-x-hidden bg-black text-white">
            <div className="sticky top-0 z-30 w-full border-b border-gray-800 bg-black/90 backdrop-blur-md">
                <div className="mx-auto w-full max-w-2xl">
                    <div className="px-3 py-3 sm:px-4 md:px-6">
                        <h1 className="text-lg font-bold text-white sm:text-xl">
                            {t("feed.home")}
                        </h1>
                    </div>

                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="flex h-auto w-full rounded-none border-b-0 bg-transparent p-0">
                            <TabsTrigger
                                value="foryou"
                                className="flex-1 min-w-0 rounded-none bg-transparent px-2 py-3 text-sm font-semibold text-gray-400 hover:bg-gray-900 hover:text-white sm:px-4 sm:text-base data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-white"
                            >
                                {t("feed.forYou")}
                            </TabsTrigger>

                            <TabsTrigger
                                value="following"
                                className="flex-1 min-w-0 rounded-none bg-transparent px-2 py-3 text-sm font-semibold text-gray-400 hover:bg-gray-900 hover:text-white sm:px-4 sm:text-base data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-white"
                            >
                                {t("feed.following")}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="mx-auto w-full max-w-2xl">
                <TweetComposer onTweetPosted={handleNewTweet} />
            </div>

            <div className="mx-auto w-full max-w-2xl divide-y divide-gray-800">
                {loading ? (
                    <Card className="rounded-none border-none bg-black">
                        <CardContent className="px-4 py-12 text-center">
                            <Loadingspinner
                                size="lg"
                                className="mx-auto mb-4"
                            />
                            <p className="text-sm text-gray-400 sm:text-base">
                                {t("feed.loadingTweets")}
                            </p>
                        </CardContent>
                    </Card>
                ) : activeTab === "following" && !userId ? (
                    <Card className="rounded-none border-none bg-black">
                        <CardContent className="px-4 py-12 text-center">
                            <p className="text-sm text-gray-400">
                                Please log in to see tweets from people you follow.
                            </p>
                        </CardContent>
                    </Card>
                ) : tweets.length === 0 ? (
                    <Card className="rounded-none border-none bg-black">
                        <CardContent className="px-4 py-12 text-center">
                            <p className="text-sm text-gray-400 sm:text-base">
                                {activeTab === "following"
                                    ? "No tweets from people you follow yet."
                                    : t("feed.noTweets")}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    tweets.map((tweet) => {
                        const tweetAsset = assets.find(
                            (item) =>
                                String(item.assetsId) === String(tweet._id)
                        );

                        return (
                            <TweetCard
                                key={tweet._id}
                                tweet={tweet}
                                asset={tweetAsset}
                                onOpenProfile={onOpenProfile}
                                className="border-b border-gray-800"
                            />
                        );
                    })
                )}
            </div>
        </main>
    );
};

export default Feed;