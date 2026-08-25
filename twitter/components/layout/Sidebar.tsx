import React from "react";
import {
    Home,
    Search,
    Bell,
    Mail,
    Bookmark,
    User,
    MoreHorizontal,
} from "lucide-react";
import { Button } from "../ui/button";

const Sidebar = ({ currentPage, onNavigate }: any) => {
    const navigation = [
        {
            name: "Home",
            icon: Home,
            current: currentPage === "home",
            page: "home",
        },
        {
            name: "Explore",
            icon: Search,
            current: currentPage === "explore",
            page: "explore",
        },
        {
            name: "Notifications",
            icon: Bell,
            current: currentPage === "notifications",
            page: "notifications",
            badge: true,
        },
        {
            name: "Messages",
            icon: Mail,
            current: currentPage === "messages",
            page: "messages",
        },
        {
            name: "Bookmarks",
            icon: Bookmark,
            current: currentPage === "bookmarks",
            page: "bookmarks",
        },
        {
            name: "Profile",
            icon: User,
            current: currentPage === "profile",
            page: "profile",
        },
        {
            name: "More",
            icon: MoreHorizontal,
            current: currentPage === "more",
            page: "more",
        },
    ];

    return (
        <div
            className="
                flex
                flex-col
                bg-black
                border-gray-800
                w-full
                h-14
                sm:h-16
                fixed
                bottom-0
                left-0
                right-0
                z-40

                md:relative
                md:bottom-auto
                md:left-auto
                md:right-auto
                md:h-screen
                md:w-64
                md:border-t-0
                md:border-r
                md:z-auto

                border-t
                md:border-t-0
            "
        >
            {/* Navigation */}
            <nav className="flex-1 px-1 md:px-3 md:pt-3 overflow-x-auto md:overflow-visible no-scrollbar">
                <ul
                    className="
                        flex
                        h-full
                        items-center
                        justify-between
                        gap-1

                        md:h-auto
                        md:block
                        md:space-y-1
                    "
                >
                    {navigation.map((item) => (
                        <li
                            key={item.name}
                            className="
                                h-full
                                flex-1

                                md:h-auto
                                md:flex-none
                            "
                        >
                            <Button
                                variant="ghost"
                                className={`
                                    w-full
                                    h-full

                                    md:h-auto
                                    md:min-h-12
                                    md:justify-start

                                    justify-center
                                    text-white
                                    text-xl

                                    py-1.5
                                    sm:py-2
                                    md:py-3
                                    px-1
                                    md:px-4

                                    rounded-full
                                    hover:bg-gray-900
                                    hover:text-white

                                    ${
                                        item.current
                                            ? "font-bold"
                                            : "font-normal"
                                    }
                                `}
                                onClick={() => onNavigate?.(item.page)}
                            >
                                <div className="relative shrink-0">
                                    <item.icon
                                        className="
                                            h-5
                                            w-5
                                            sm:h-6
                                            sm:w-6
                                            md:h-7
                                            md:w-7
                                            md:mr-4
                                        "
                                    />

                                    {item.badge && (
                                        <span
                                            className="
                                                absolute
                                                -top-1
                                                -right-1
                                                md:hidden
                                                bg-blue-500
                                                text-white
                                                text-[9px]
                                                rounded-full
                                                h-3.5
                                                w-3.5
                                                flex
                                                items-center
                                                justify-center
                                            "
                                        >
                                            3
                                        </span>
                                    )}
                                </div>

                                <span className="hidden md:inline">
                                    {item.name}
                                </span>

                                {item.badge && (
                                    <span
                                        className="
                                            hidden
                                            md:flex
                                            ml-2
                                            bg-blue-500
                                            text-white
                                            text-xs
                                            rounded-full
                                            h-5
                                            w-5
                                            items-center
                                            justify-center
                                        "
                                    >
                                        3
                                    </span>
                                )}
                            </Button>
                        </li>
                    ))}
                </ul>

                {/* Post button directly below More */}
                <div
                    className="
                        hidden
                        md:block
                        mt-2
                        px-2
                    "
                >
                    <Button
                        className="
                            w-full
                            bg-blue-500
                            hover:bg-blue-600
                            text-white
                            font-bold
                            py-3
                            rounded-full
                            text-lg
                        "
                    >
                        Post
                    </Button>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;