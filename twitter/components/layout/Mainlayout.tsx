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
import LandingPage from "@/components/LandingPage";
import { ArrowLeft } from "lucide-react"

const Mainlayout = ({ children }: any) => {
    const { isLoading, user } = useAuth();

    const [currentPage, setCurrentPage] = useState("home");
    const [selectedProfileUsername, setSelectedProfileUsername] =
        useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showLandingPage, setShowLandingPage] = useState(false);

    // Open the full landing page, including Google and account options.
    const goToLogin = () => {
        setShowLandingPage(true);
    };

    const requireLogin = () => {
        if (user) return true;

        goToLogin();
        return false;
    };

    // Guests can search without logging in.
    const goSearch = (query: string) => {
        setSearchQuery(query);
        setSelectedProfileUsername(null);
        setCurrentPage("explore");
        setShowLandingPage(false);
    };

    const openProfile = (username: string) => {
        if (!username) return;
        if (!requireLogin()) return;

        setSelectedProfileUsername(username);
    };

    const closeProfile = () => {
        setSelectedProfileUsername(null);
    };

    // Only Home and Explore are public navigation pages.
    const handleNavigate = (page: string) => {
        const publicPages = ["home", "explore"];

        if (!user && !publicPages.includes(page)) {
            requireLogin();
            return;
        }

        setShowLandingPage(false);
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
    
    if (!user && showLandingPage) {
        return (
            <div className="min-h-screen bg-black text-white">
                <LandingPage />
                <button
                    type="button"
                    onClick={() => setShowLandingPage(false)}
                    className="fixed left-4 top-4 z-40 rounded-full border border-gray-700 bg-black px-4 py-2 text-sm text-white hover:bg-gray-900"
                >
                    <ArrowLeft /> Back
                </button>
            </div>
        );
    }

    // Guests are allowed to browse Home and Explore.
    // Other in-layout features show a login prompt.
    const showLoginMessage =
        !user && !["home", "explore"].includes(currentPage);

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
                            <h2 className="text-2xl font-bold text-white">
                                Login required
                            </h2>

                            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-400">
                                Log in to access this feature. You can
                                continue browsing tweets and searching
                                without logging in.
                            </p>

                            <button
                                type="button"
                                onClick={goToLogin}
                                className="mt-6 rounded-full bg-[#3EE6A8] px-8 py-3 font-semibold text-black transition hover:bg-[#2bd99a]"
                            >
                                Log in
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedProfileUsername(null);
                                    setCurrentPage("home");
                                }}
                                className="mt-3 rounded-full border border-gray-700 px-8 py-2.5 text-sm text-white transition hover:bg-gray-900"
                            >
                                Back to Home
                            </button>
                        </div>
                    ) : selectedProfileUsername ? (
                        <ProfilePage
                            username={selectedProfileUsername}
                            onBack={closeProfile}
                        />
                    ) : currentPage === "profile" ? (
                        user ? <ProfilePage /> : null
                    ) : currentPage === "notifications" ? (
                        user ? (
                            <Notifications userId={user._id} />
                        ) : null
                    ) : currentPage === "more" ? (
                        user ? (
                            <LanguageDropdown userId={user._id} />
                        ) : null
                    ) : currentPage === "explore" ? (
                        <Explore initalQuery={searchQuery} />
                    ) : currentPage === "follow" ? (
                        user ? (
                            <FollowPage onOpenProfile={openProfile} />
                        ) : null
                    ) : currentPage === "home" ? (
                        <Feed onOpenProfile={openProfile} />
                    ) : (
                        user ? (
                            React.isValidElement(children) ? (
                                React.cloneElement(
                                    children as React.ReactElement<any>,
                                    { onOpenProfile: openProfile }
                                )
                            ) : (
                                children
                            )
                        ) : (
                            <div className="p-6 text-center">
                                <p className="text-gray-400">
                                    Please log in to access this feature.
                                </p>

                                <button
                                    type="button"
                                    onClick={goToLogin}
                                    className="mt-4 rounded-full bg-[#3EE6A8] px-6 py-2 font-semibold text-black"
                                >
                                    Log in
                                </button>
                            </div>
                        )
                    )}
                </main>

                {/* RIGHT SIDEBAR: SEARCH */}
                <aside className="no-scrollbar hidden h-full min-w-0 overflow-y-auto pl-6 xl:block">
                    <RightSidebar onSearch={goSearch} />
                </aside>
            </div>
        </div>
    );
};

export default Mainlayout;
