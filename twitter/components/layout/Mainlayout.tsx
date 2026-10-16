
"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Loadingspinner from "@/components/Loading-spinner";
import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/Rightsidebar";
import ProfilePage from "@/components/ProfilePgae";
import Notifications from "@/components/Notifications";
import LanguageDropdown from "@/components/LanguageDropdown";
import FollowPage from "@/components/FollowPage";
import Explore from "@/components/Explore";
import Feed from "@/components/Feed";

const Mainlayout = ({ children }: any) => {
    const { isLoading, user } = useAuth();

    const [currentPage, setCurrentPage] = useState("home");
    const [selectedProfileUsername, setSelectedProfileUsername] =
        useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const goSearch = (query: string) => {
        setSearchQuery(query);
        setSelectedProfileUsername(null);
        setCurrentPage("explore");
    };

    const requireLogin = () => {
        if (user) return true;

        alert("Please log in to access this feature.");
        return false;
    };

    const openProfile = (username: string) => {
        // Profiles are login-only for now.
        if (!requireLogin()) return;
        if (!username) return;

        setSelectedProfileUsername(username);
    };

    const closeProfile = () => {
        setSelectedProfileUsername(null);
    };

    const handleNavigate = (page: string) => {
        const protectedPages = [
            "profile",
            "notifications",
            "more",
            "follow",
        ];

        if (protectedPages.includes(page) && !requireLogin()) {
            return;
        }

        setSelectedProfileUsername(null);
        setCurrentPage(page);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-black">
                <Loadingspinner />
            </div>
        );
    }

    const showLoginMessage = !user && [
        "profile",
        "notifications",
        "more",
        "follow",
    ].includes(currentPage);

    return (
        <div className="h-screen w-full overflow-hidden bg-black text-white">
            <div
                className="
                    mx-auto grid h-full justify-center
                    grid-cols-[72px_minmax(0,600px)]
                    xl:grid-cols-[275px_minmax(0,600px)_350px]
                "
            >
                {/* LEFT SIDEBAR */}
                <header className="h-full min-w-0">
                    <Sidebar
                        currentPage={currentPage}
                        onNavigate={handleNavigate}
                    />
                </header>

                {/* MAIN CONTENT */}
                <main className="no-scrollbar h-full min-w-0 overflow-y-auto overflow-x-hidden border-x border-gray-800">
                    {showLoginMessage ? (
                        <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
                            <h2 className="text-xl font-bold text-white">
                                Login required
                            </h2>
                            <p className="mt-2 text-sm text-gray-400">
                                Please log in to access this feature.
                            </p>
                        </div>
                    ) : selectedProfileUsername ? (
                        <ProfilePage
                            username={selectedProfileUsername}
                            onBack={closeProfile}
                        />
                    ) : currentPage === "profile" ? (
                        <ProfilePage />
                    ) : currentPage === "notifications" ? (
                        <Notifications userId={user!._id} />
                    ) : currentPage === "more" ? (
                        <LanguageDropdown userId={user!._id} />
                    ) : currentPage === "explore" ? (
                        <Explore initalQuery={searchQuery} />
                    ) : currentPage === "follow" ? (
                        <FollowPage onOpenProfile={openProfile} />
                    ) : (
                        <Feed onOpenProfile={openProfile} />
                    )}
                </main>

                {/* RIGHT SIDEBAR: SEARCH AND OTHER EXISTING WIDGETS */}
                <aside className="no-scrollbar hidden h-full min-w-0 overflow-y-auto pl-6 xl:block">
                    <RightSidebar onSearch={goSearch} />
                </aside>
            </div>
        </div>
    );
};

export default Mainlayout;
