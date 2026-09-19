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
    Volume2,
} from "lucide-react";
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

    const [audioFile, setAudioFile] = useState<File | null>(null);

    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);

    const maxlength = 200;

    const characterCount = content.length;
    const isOverLimit = characterCount > maxlength;
    const isNearLimit = characterCount > maxlength * 0.8;

    const hasContent = content.trim().length > 0;
    const hasImage = imageUrl.trim().length > 0;
    const hasAudio = isAudioUrl.trim().length > 0;

    const canPost = hasContent || hasImage || hasAudio;

    if (!user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("AUDIO URL GOING TO TWEET:", isAudioUrl);


        if (!user || !canPost || isOverLimit || isLoading) {
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

            console.log("TWEET DATA:", tweetdata);
            const res = await axiosInstance.post(
                "/post",
                tweetdata
            );

            onTweetPosted(res.data);

            setContent("");
            setImageUrl("");
            setIsAudioUrl("");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(
                    "failed to create tweet:",
                    error.response?.data
                );
            } else {
                console.error(
                    "failed to create tweet:",
                    error
                );
            }
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

    const handleAudioUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        const audio = e.target.files[0];

        // 100 MB limit
        const maxSize = 100 * 1024 * 1024;

        if (audio.size > maxSize) {
            alert("Audio size limit exceeded. Maximum 100 MB allowed.");
            e.target.value = "";
            return;
        }

        // Check audio type
        if (!audio.type.startsWith("audio/")) {
            alert("Please select an audio file");
            e.target.value = "";
            return;
        }

        setAudioFile(audio);

        // OTP request
        try {
            setIsLoading(true);

            const formdataaudio = new FormData();

            formdataaudio.append("audio", audio);
            formdataaudio.append("userId", user._id);
            formdataaudio.append("otpVerified", "false");

            const res = await axios.post(
                "http://localhost:5000/upload-audio",
                formdataaudio
            );

            console.log("Audio OTP response:", res.data);

            if (res.data.requiresOtp) {
                setShowOtp(true);

                alert(
                    "OTP has been sent to your registered email."
                );
            }
        } catch (error) {
            console.error("Audio OTP request failed:", error);
            alert("Failed to send OTP");
            setAudioFile(null);
        } finally {
            setIsLoading(false);
        }
    };

    const verifyAudioOtp = async () => {
        if (!otp || otp.length !== 6) {
            alert("Please enter a valid OTP");
            return;
        }

        if (!audioFile) {
            alert("Audio file is required");
            return;
        }

        try {
            setOtpLoading(true);

            const verifyResponse = await axios.post(
                "http://localhost:5000/verift-otp", {
                userId: user._id,
                otp: otp
            }
            )

            console.log("otp response", verifyResponse.data);

            if (!verifyResponse.data.success) {
                alert("Inlavlid otp");
                return;
            }

            const formdataaudio = new FormData();

            formdataaudio.append("audio", audioFile);
            formdataaudio.append("userId", user._id);
            formdataaudio.append("otpVerified", "true");

            const uploadResponse = await axios.post(
                "http://localhost:5000/upload-audio",
                formdataaudio, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
            }
            )

            console.log("audio upload response", uploadResponse.data);

            if (uploadResponse.data.success) {
                setIsAudioUrl(uploadResponse.data.audioUrl);
                setShowOtp(false);
                setOtp("");
                alert("Audio uploaded successfully");
            }

        } catch (error) {
            console.error(
                "OTP verification / audio upload failed:",
                error
            );

            if (axios.isAxiosError(error)) {
                alert(
                    error.response?.data?.message ||
                    "OTP verification failed"
                );
            } else {
                alert("Something went wrong");
            }
        } finally {
            setOtpLoading(false);
        }
    }

    const removeImage = () => {
        setImageUrl("");
    };

    const removeAudio = () => {
        setIsAudioUrl("");
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
                                <div className="relative mt-2 mb-3 rounded-2xl border border-gray-700 bg-[#16181c] p-2">
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
                border-gray-700
            "
                                    />

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={removeImage}
                                        className="
                absolute
                top-3
                right-3
                h-8
                w-8
                rounded-full
                bg-black/70
                hover:bg-red-600
                text-white
                transition-colors
            "
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Audio Preview */}
                            {isAudioUrl && (
                                <div
                                    className="
            relative
            mt-2
            mb-3
            rounded-2xl
            border
            border-gray-700
            bg-[#16181c]
            p-4
        "
                                >
                                    <div className="flex items-center gap-3 pr-8">
                                        {/* Audio Icon */}
                                        <div
                                            className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-500/15
                    text-blue-400
                "
                                        >
                                            <Volume2 className="h-5 w-5" />
                                        </div>

                                        {/* Audio Player */}
                                        <audio
                                            controls
                                            preload="metadata"
                                            className="h-10 w-full"
                                        >
                                            <source
                                                src={isAudioUrl}
                                                type="audio/mpeg"
                                            />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>

                                    {/* Remove Audio Button */}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={removeAudio}
                                        className="
                absolute
                top-3
                right-3
                h-8
                w-8
                rounded-full
                bg-black/70
                text-white
                hover:bg-red-600
                transition-colors
            "
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Audio OTP Verification */}
                            {showOtp && (
                                <div className="mt-4 mb-4 rounded-2xl border border-gray-700 bg-[#16181c] p-4">

                                    <div className="mb-3">
                                        <h3 className="text-white font-semibold text-base">
                                            Verify Audio Upload
                                        </h3>

                                        <p className="text-gray-400 text-sm mt-1">
                                            Enter the 6-digit OTP sent to your registered email.
                                        </p>
                                    </div>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => {
                                            const value = e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 6);

                                            setOtp(value);
                                        }}
                                        placeholder="Enter 6-digit OTP"
                                        className="
                w-full
                h-11
                rounded-xl
                bg-black
                border
                border-gray-700
                px-4
                text-white
                placeholder-gray-500
                outline-none
                focus:border-blue-500
            "
                                        disabled={otpLoading}
                                    />

                                    <Button
                                        type="button"
                                        onClick={verifyAudioOtp}
                                        disabled={otpLoading || otp.length !== 6}
                                        className="
                w-full
                mt-3
                bg-blue-500
                hover:bg-blue-600
                disabled:bg-gray-700
                disabled:text-gray-500
                text-white
                font-semibold
                rounded-xl
                h-11
            "
                                    >
                                        {otpLoading ? "Verifying..." : "Verify OTP"}
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
                                            !canPost ||
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