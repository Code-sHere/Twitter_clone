"use client";

import React, { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "./ui/card";

import { Button } from "./ui/button";

import {
    Camera,
    X,
    MapPin,
    LinkIcon,
} from "lucide-react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "./ui/avatar";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

import axios from "axios";

interface EditProfileProps {
    isopen: boolean;
    onclose: () => void;
}

const EditProfile = ({
    isopen,
    onclose,
}: EditProfileProps) => {
    const { user, updateProfile } = useAuth();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        displayName: user?.displayName || "",
        bio: user?.bio || "",
        location: user?.location || "Earth",
        website: user?.website || "",
        avatar: user?.avatar || "",
    });

    const [error, setError] = useState<Record<string, string>>({});

    if (!isopen || !user) {
        return null;
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.displayName.trim()) {
            newErrors.displayName =
                "Display name is required";
        } else if (formData.displayName.length > 50) {
            newErrors.displayName =
                "Display name must be less than 50 characters";
        }

        if (formData.bio.length > 160) {
            newErrors.bio =
                "Bio must be less than 160 characters";
        }

        if (formData.website.length > 100) {
            newErrors.website =
                "Website must be less than 100 characters";
        }

        if (formData.location.length > 30) {
            newErrors.location =
                "Location must be less than 30 characters";
        }

        setError(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!validateForm() || isLoading) {
            return;
        }

        try {
            setIsLoading(true);

            await updateProfile(formData);

            onclose();
        } catch (err) {
            console.error(err);

            setError({
                general: "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (
        field: string,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (error[field]) {
            setError((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    const handlePhotoUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (
            !e.target.files ||
            e.target.files.length === 0
        ) {
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
                setFormData((prev) => ({
                    ...prev,
                    avatar: url,
                }));
            }
        } catch (err) {
            console.error("Image upload failed:", err);

            setError({
                general: "Failed to upload image.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/70
                backdrop-blur-sm
                p-3
                sm:p-4
            "
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onclose();
                }
            }}
        >
            <Card
                className="
                    relative
                    w-full
                    max-w-xl
                    max-h-[94vh]
                    sm:max-h-[90vh]
                    overflow-y-auto
                    bg-black
                    border-gray-800
                    rounded-xl
                    sm:rounded-2xl
                "
            >
                {/* Header */}
                <CardHeader
                    className="
                        sticky
                        top-0
                        z-20
                        bg-black/95
                        backdrop-blur-md
                        border-b
                        border-gray-800
                        px-4
                        sm:px-6
                        py-3
                        sm:py-4
                    "
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onclose}
                                className="rounded-full shrink-0"
                            >
                                <X className="h-5 w-5 text-white" />
                            </Button>

                            <CardTitle className="text-base sm:text-xl text-white truncate">
                                Edit Profile
                            </CardTitle>
                        </div>

                        <Button
                            type="submit"
                            form="edit-profile-form"
                            disabled={isLoading}
                            className="
                                shrink-0
                                rounded-full
                                bg-white
                                text-black
                                hover:bg-gray-200
                                font-semibold
                                px-4
                                sm:px-5
                            "
                        >
                            {isLoading ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {error.general && (
                        <div className="mx-4 sm:mx-6 mt-4 bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
                            {error.general}
                        </div>
                    )}

                    <form
                        id="edit-profile-form"
                        onSubmit={handleSubmit}
                    >
                        {/* Cover */}
                        <div className="relative">
                            <div
                                className="
                                    h-32
                                    sm:h-44
                                    md:h-48
                                    bg-gradient-to-r
                                    from-blue-600
                                    to-purple-600
                                "
                            >
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={isLoading}
                                    className="
                                        absolute
                                        top-1/2
                                        left-1/2
                                        -translate-x-1/2
                                        -translate-y-1/2
                                        h-10
                                        w-10
                                        sm:h-12
                                        sm:w-12
                                        rounded-full
                                        bg-black/70
                                        hover:bg-black/90
                                    "
                                >
                                    <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                </Button>
                            </div>

                            {/* Avatar */}
                            <div
                                className="
                                    absolute
                                    left-4
                                    sm:left-6
                                    -bottom-10
                                    sm:-bottom-14
                                "
                            >
                                <div className="relative">
                                    <Avatar
                                        className="
                                            h-20
                                            w-20
                                            sm:h-28
                                            sm:w-28
                                            rounded-full
                                            border-4
                                            border-black
                                            bg-black
                                        "
                                    >
                                        <AvatarImage
                                            src={
                                                formData.avatar ||
                                                user.avatar
                                            }
                                            alt={
                                                user.displayName
                                            }
                                            className="h-full w-full object-cover"
                                        />

                                        <AvatarFallback
                                            className="
                                                h-full
                                                w-full
                                                rounded-full
                                                bg-gray-800
                                                text-white
                                                text-xl
                                                sm:text-3xl
                                                font-bold
                                                flex
                                                items-center
                                                justify-center
                                            "
                                        >
                                            {user.displayName
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        disabled={isLoading}
                                        className="
                                            absolute
                                            bottom-0
                                            right-0
                                            h-7
                                            w-7
                                            sm:h-9
                                            sm:w-9
                                            rounded-full
                                            bg-black/80
                                            border
                                            border-white/30
                                            hover:bg-black
                                        "
                                    >
                                        <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                                    </Button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={
                                            handlePhotoUpload
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div
                            className="
                                px-4
                                sm:px-6
                                pt-16
                                sm:pt-20
                                pb-6
                                space-y-5
                            "
                        >
                            {/* Display Name */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="displayName"
                                    className="text-white"
                                >
                                    Name
                                </Label>

                                <Input
                                    id="displayName"
                                    type="text"
                                    value={
                                        formData.displayName
                                    }
                                    onChange={(e) =>
                                        handleInputChange(
                                            "displayName",
                                            e.target.value
                                        )
                                    }
                                    className="
                                        h-11
                                        bg-transparent
                                        border-gray-600
                                        text-white
                                        placeholder-gray-400
                                        focus:border-blue-500
                                    "
                                    placeholder="Your display name"
                                    maxLength={50}
                                    disabled={isLoading}
                                />

                                <div className="flex justify-between text-xs sm:text-sm">
                                    {error.displayName ? (
                                        <p className="text-red-400">
                                            {error.displayName}
                                        </p>
                                    ) : (
                                        <span />
                                    )}

                                    <p className="text-gray-400">
                                        {
                                            formData
                                                .displayName
                                                .length
                                        }
                                        /50
                                    </p>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="bio"
                                    className="text-white"
                                >
                                    Bio
                                </Label>

                                <Textarea
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "bio",
                                            e.target.value
                                        )
                                    }
                                    className="
                                        bg-transparent
                                        border-gray-600
                                        text-white
                                        placeholder-gray-400
                                        focus:border-blue-500
                                        resize-none
                                        min-h-[100px]
                                    "
                                    placeholder="Tell the world about yourself"
                                    maxLength={160}
                                    disabled={isLoading}
                                />

                                <div className="flex justify-between text-xs sm:text-sm">
                                    {error.bio ? (
                                        <p className="text-red-400">
                                            {error.bio}
                                        </p>
                                    ) : (
                                        <span />
                                    )}

                                    <p className="text-gray-400">
                                        {formData.bio.length}/160
                                    </p>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="location"
                                    className="text-white"
                                >
                                    Location
                                </Label>

                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

                                    <Input
                                        id="location"
                                        type="text"
                                        value={
                                            formData.location
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "location",
                                                e.target.value
                                            )
                                        }
                                        className="
                                            h-11
                                            pl-10
                                            bg-transparent
                                            border-gray-600
                                            text-white
                                            placeholder-gray-400
                                            focus:border-blue-500
                                        "
                                        placeholder="Where are you located?"
                                        maxLength={30}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="flex justify-between text-xs sm:text-sm">
                                    {error.location ? (
                                        <p className="text-red-400">
                                            {error.location}
                                        </p>
                                    ) : (
                                        <span />
                                    )}

                                    <p className="text-gray-400">
                                        {
                                            formData.location
                                                .length
                                        }
                                        /30
                                    </p>
                                </div>
                            </div>

                            {/* Website */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="website"
                                    className="text-white"
                                >
                                    Website
                                </Label>

                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

                                    <Input
                                        id="website"
                                        type="text"
                                        value={
                                            formData.website
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "website",
                                                e.target.value
                                            )
                                        }
                                        className="
                                            h-11
                                            pl-10
                                            bg-transparent
                                            border-gray-600
                                            text-white
                                            placeholder-gray-400
                                            focus:border-blue-500
                                        "
                                        placeholder="Your website URL"
                                        maxLength={100}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="flex justify-between text-xs sm:text-sm">
                                    {error.website ? (
                                        <p className="text-red-400">
                                            {error.website}
                                        </p>
                                    ) : (
                                        <span />
                                    )}

                                    <p className="text-gray-400">
                                        {
                                            formData.website
                                                .length
                                        }
                                        /100
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EditProfile;