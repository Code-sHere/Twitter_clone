"use client";
import React from "react";
import {
  Home, Search, Bell, UserPlus, MessageCircle, Slash,
  Bookmark, BadgeCheck, User, MoreHorizontal, Feather,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

const Sidebar = ({ currentPage, onNavigate }: any) => {
  const { t } = useTranslation();
  const { user }: any = useAuth();

  const navigation = [
    { name: t("nav.home", "Home"), icon: Home, page: "home" },
    { name: t("nav.explore", "Explore"), icon: Search, page: "explore" },
    { name: t("nav.notifications", "Notifications"), icon: Bell, page: "notifications", badge: true },
    { name: t("nav.follow", "Follow"), icon: UserPlus, page: "follow" },
    { name: t("nav.messages", "Chat"), icon: MessageCircle, page: "messages" },
    { name: t("nav.grok", "Grok"), icon: Slash, page: "grok" },
    { name: t("nav.bookmarks", "History"), icon: Bookmark, page: "bookmarks" },
    { name: t("nav.premium", "Premium"), icon: BadgeCheck, page: "premium" },
    { name: t("nav.profile", "Profile"), icon: User, page: "profile" },
    { name: t("nav.more", "More"), icon: MoreHorizontal, page: "more" },
  ];

  const displayName = user?.displayName ?? user?.name ?? "User";
  const username = user?.username ?? "user";

  return (
    <div className="flex h-full w-full flex-col justify-between items-center xl:items-stretch px-2 py-2">
      <div className="flex flex-col items-center xl:items-stretch">
        {/* Logo */}
        <div className="flex h-12 w-12 items-center justify-center text-2xl font-bold xl:ml-2">
          𝕏
        </div>

        {/* Nav */}
        <nav className="mt-1">
          <ul className="flex flex-col items-center gap-1 xl:items-stretch">
            {navigation.map((item) => {
              const active = currentPage === item.page;
              return (
                <li key={item.page}>
                  <button
                    onClick={() => onNavigate?.(item.page)}
                    aria-label={item.name}
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-colors hover:bg-gray-900 xl:w-auto xl:justify-start xl:gap-5 xl:px-4 ${
                      active ? "font-bold" : "font-normal"
                    }`}
                  >
                    <span className="relative">
                      <item.icon className="h-6 w-6" strokeWidth={active ? 2.75 : 2} />
                      {item.badge && (
                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </span>
                    <span className="hidden text-xl xl:inline">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Post: circle on rail, wide button on xl */}
        <button className="mt-4 flex h-12 w-12 items-center justify-center self-center rounded-full bg-white text-black hover:bg-gray-200 xl:w-[90%] xl:self-start">
          <Feather className="h-5 w-5 xl:hidden" />
          <span className="hidden text-base font-bold xl:inline">Post</span>
        </button>
      </div>

      {/* Account block, pinned to the bottom */}
      <button className="mb-2 flex items-center gap-3 rounded-full p-2 hover:bg-gray-900">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-600 font-semibold">
          {displayName[0]}
        </div>
        <div className="hidden min-w-0 flex-1 text-left xl:block">
          <p className="truncate text-sm font-bold">{displayName}</p>
          <p className="truncate text-sm text-gray-500">@{username}</p>
        </div>
        <MoreHorizontal className="hidden h-4 w-4 xl:block" />
      </button>
    </div>
  );
};

export default Sidebar;