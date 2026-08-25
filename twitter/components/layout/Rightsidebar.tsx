"use client";

import { Search, Bell } from "lucide-react";
import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";

const suggestions = [
    {
        id: "1",
        username: "narendramodi",
        displayName: "Narendra Modi",
        avatar:
            "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
        id: "2",
        username: "akshaykumar",
        displayName: "Akshay Kumar",
        avatar:
            "https://images.pexels.com/photos/1382735/pexels-photo-1382735.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
        id: "3",
        username: "rashtrapatibhvn",
        displayName: "President of India",
        avatar:
            "https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
];

export default function TopNavbar({
    currentUser = { name: "Vansh", username: "vansh858688", avatar: null },
}) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/90 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-[1265px] items-center gap-6 px-4">

                {/* Left: profile avatar (top-left corner) + brand */}
                <div className="flex items-center gap-3 shrink-0">
                    <Link href="/profile">
                        <Avatar className="h-9 w-9 border-2 border-blue-500 cursor-pointer">
                            <AvatarImage
                                src={currentUser.avatar ?? undefined}
                                alt={currentUser.name}
                            />
                            <AvatarFallback className="bg-blue-500 text-white font-semibold">
                                {currentUser.name[0]}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                    <span className="hidden sm:block text-white font-bold text-xl leading-none">
                        𝕏
                    </span>
                </div>

                {/* Center: search */}
                <div className="flex-1 flex justify-center">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search"
                            className="pl-11 bg-gray-900 border-gray-800 text-white placeholder-gray-500 rounded-full h-10"
                        />
                    </div>
                </div>

                {/* Right: who to follow + notifications + subscribe */}
                <div className="flex items-center gap-3 shrink-0">

                    <div className="hidden md:flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full pl-1.5 pr-3 py-1">
                        <div className="flex -space-x-2">
                            {suggestions.map((user) => (
                                <Avatar
                                    key={user.id}
                                    className="h-6 w-6 border-2 border-gray-900"
                                >
                                    <AvatarImage
                                        src={user.avatar}
                                        alt={user.displayName}
                                    />
                                    <AvatarFallback className="text-[10px]">
                                        {user.displayName[0]}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                            Who to follow
                        </span>
                    </div>

                    <button
                        className="relative h-9 w-9 flex items-center justify-center rounded-full text-gray-300 hover:bg-gray-900 hover:text-white transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-black" />
                    </button>

                    <Button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full px-4"
                        asChild
                    >
                        <Link href="/plans">Subscribe</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}