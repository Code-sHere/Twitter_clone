"use client";

import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
    Image as ImageIcon,
    Smile,
    Music,
    Calendar,
    MapPin,
    BarChart3,
    Globe,
    X,
} from "lucide-react";
import { Separator } from "./ui/separator";
import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";

const TweetComposer = ({
    onTweetPosted,
}: {
    onTweetPosted: (tweet: any) => void;
}) => {
    const { user } = useAuth();

    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [isAudioUrl, setIsAudioUrl] = useState("");

    const maxlength = 200;

    const characterCount = content.length;
    const isOverLimit = characterCount > maxlength;
    const isNearLimit = characterCount > maxlength * 0.8;

    if (!user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !content.trim() || isOverLimit || isLoading) {
            return;
        }

        try {
            setIsLoading(true);

            const tweetdata = {
                author: user?._id,
                content,
                image: imageUrl,
                audio: isAudioUrl
            };

            const res = await axiosInstance.post(
                "/post",
                tweetdata
            );

            onTweetPosted(res.data);

            setContent("");
            setImageUrl("");
        } catch (error) {
            console.error("Failed to create tweet:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhotoUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        setIsLoading(true);

        const image = e.target.files[0];

        const formdataimg = new FormData();

        formdataimg.set("image", image);

        try {
            const res = await axios.post(
                "https://api.imgbb.com/1/upload?key=e718dc1f3c559c247b8d25f4843dcd15",
                formdataimg
            );

            const url = res.data.data.display_url;

            if (url) {
                setImageUrl(url);
            }
        } catch (error) {
            console.error("Image upload failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAudioUpload = async ( e: React.ChangeEvent<HTMLInputElement>) =>{

        if(!e.target.files || e.target.files.length===0){
            return;
        }

        setIsLoading(true);

        const audio = e.target.files[0];

        //100 mb limit
        const maxSize = 100 * 1024 *1024;

        if(audio.size > maxSize){
            alert("Audio size limit exceeded");
            setIsLoading(false);
            return;
        }

        //chek audio type 
        if(!audio.type.startsWith("audio/")){
            alert("Please select an audio file");
            setIsLoading(false);
            return;
        }

        const formdataaudio = new FormData();

        formdataaudio.set("audio", audio);

        try{
            const res = await axios.post{
                
            }
        }

    }

    const removeImage = () => {
        setImageUrl("");
    };

    return (
        <Card
            className="
                w-full
                bg-black
                border-gray-800
                border-x-0
                border-t-0
                rounded-none
            "
        >
            <CardContent className="p-3 sm:p-4">
                <div className="flex gap-3 sm:gap-4">
                    {/* Avatar */}
                    <Avatar className="h-9 w-9 sm:h-12 sm:w-12 shrink-0">
                        <AvatarImage
                            src={user.avatar}
                            alt={user.displayName}
                        />

                        <AvatarFallback>
                            {user.displayName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {/* Composer */}
                    <div className="flex-1 min-w-0">
                        <form onSubmit={handleSubmit}>
                            <Textarea
                                value={content}
                                onChange={(e) =>
                                    setContent(e.target.value)
                                }
                                placeholder="What is happening?!"
                                className="
                                    w-full
                                    bg-transparent
                                    border-none
                                    text-base
                                    sm:text-xl
                                    text-white
                                    placeholder-gray-500
                                    resize-none
                                    min-h-[90px]
                                    sm:min-h-[120px]
                                    px-0
                                    focus-visible:ring-0
                                    focus-visible:ring-offset-0
                                "
                                disabled={isLoading}
                            />

                            {/* Image Preview */}
                            {imageUrl && (
                                <div className="relative mt-2 mb-3">
                                    <img
                                        src={imageUrl}
                                        alt="Tweet preview"
                                        className="
                                            w-full
                                            max-h-[300px]
                                            sm:max-h-[400px]
                                            object-cover
                                            rounded-xl
                                            border
                                            border-gray-800
                                        "
                                    />

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={removeImage}
                                        className="
                                            absolute
                                            top-2
                                            right-2
                                            h-8
                                            w-8
                                            rounded-full
                                            bg-black/70
                                            hover:bg-black
                                            text-white
                                        "
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Bottom Controls */}
                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-3
                                    mt-3
                                    sm:mt-4
                                "
                            >
                                {/* Icons */}
                                <div className="flex items-center justify-between gap-2">
                                    <div
                                        className="
                                            flex
                                            items-center
                                            flex-wrap
                                            gap-0.5
                                            text-blue-400
                                        "
                                    >
                                        {/* Image */}
                                        <label
                                            htmlFor="tweetAudio"
                                            className="
                                                p-2
                                                rounded-full
                                                hover:bg-blue-900/20
                                                cursor-pointer
                                            "
                                        >
                                            <Music className="h-5 w-5" />

                                            <input
                                                type="file"
                                                accept="audio/*"
                                                id="tweetAudio"
                                                className="hidden"
                                                onChange={
                                                    handleAudioUpload
                                                }
                                                disabled={isLoading}
                                            />
                                        </label>

                                        {/* Image */}
                                        <label
                                            htmlFor="tweetImage"
                                            className="
                                                p-2
                                                rounded-full
                                                hover:bg-blue-900/20
                                                cursor-pointer
                                            "
                                        >
                                            <ImageIcon className="h-5 w-5" />

                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="tweetImage"
                                                className="hidden"
                                                onChange={
                                                    handlePhotoUpload
                                                }
                                                disabled={isLoading}
                                            />
                                        </label>

                                        {/* Poll */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="
                                                p-2
                                                rounded-full
                                                hover:bg-blue-900/20
                                            "
                                        >
                                            <BarChart3 className="h-5 w-5" />
                                        </Button>

                                        {/* Emoji */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="
                                                p-2
                                                rounded-full
                                                hover:bg-blue-900/20
                                            "
                                        >
                                            <Smile className="h-5 w-5" />
                                        </Button>

                                        {/* Calendar */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="
                                                p-2
                                                rounded-full
                                                hover:bg-blue-900/20
                                            "
                                        >
                                            <Calendar className="h-5 w-5" />
                                        </Button>

                                        {/* Location */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="
                                                p-2
                                                rounded-full
                                                hover:bg-blue-900/20
                                            "
                                        >
                                            <MapPin className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    {/* Character Count */}
                                    {characterCount > 0 && (
                                        <div className="flex items-center gap-2">
                                            <div className="relative w-7 h-7 sm:w-8 sm:h-8 shrink-0">
                                                <svg
                                                    className="
                                                        w-7
                                                        h-7
                                                        sm:w-8
                                                        sm:h-8
                                                        -rotate-90
                                                    "
                                                >
                                                    <circle
                                                        cx="50%"
                                                        cy="50%"
                                                        r="14"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        fill="none"
                                                        className="text-gray-700"
                                                    />

                                                    <circle
                                                        cx="50%"
                                                        cy="50%"
                                                        r="14"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        fill="none"
                                                        strokeDasharray={
                                                            2 *
                                                            Math.PI *
                                                            14
                                                        }
                                                        strokeDashoffset={
                                                            2 *
                                                            Math.PI *
                                                            14 *
                                                            (1 -
                                                                characterCount /
                                                                maxlength)
                                                        }
                                                        className={
                                                            isOverLimit
                                                                ? "text-red-500"
                                                                : isNearLimit
                                                                    ? "text-yellow-500"
                                                                    : "text-blue-500"
                                                        }
                                                    />
                                                </svg>
                                            </div>

                                            {isNearLimit && (
                                                <span
                                                    className={`text-xs sm:text-sm ${isOverLimit
                                                        ? "text-red-500"
                                                        : "text-yellow-500"
                                                        }`}
                                                >
                                                    {maxlength -
                                                        characterCount}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Reply + Post */}
                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-3
                                        border-t
                                        border-gray-800
                                        pt-3
                                    "
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Globe className="h-4 w-4 text-blue-400 shrink-0" />

                                        <span className="text-xs sm:text-sm text-blue-400 font-semibold truncate">
                                            Everyone can reply
                                        </span>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={
                                            !content.trim() ||
                                            isOverLimit ||
                                            isLoading
                                        }
                                        className="
                                            shrink-0
                                            bg-blue-500
                                            hover:bg-blue-600
                                            disabled:bg-gray-700
                                            disabled:text-gray-500
                                            text-white
                                            font-semibold
                                            rounded-full
                                            px-4
                                            sm:px-6
                                            h-9
                                            sm:h-10
                                        "
                                    >
                                        {isLoading
                                            ? "Posting..."
                                            : "Post"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TweetComposer;