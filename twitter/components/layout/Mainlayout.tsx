"use client";
import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Loadingspinner from '@/components/Loading-spinner';
import Sidebar from '@/components/layout/Sidebar';
import RightSidebar from '@/components/layout/Rightsidebar';
import ProfilePage from '@/components/ProfilePgae';
import Notifications from '@/components/Notifications';
import LanguageDropdown from '@/components/LanguageDropdown';



const Mainlayout = ({ children }: any) => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");

  const userId = user?._id;

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <Loadingspinner />
      </div>
    )
  }

  if (!user) {
    return <>{children}</>
  }

  return (
  <div className="h-screen w-full overflow-hidden bg-black text-white">
    <div
      className="
        mx-auto grid h-full justify-center
        grid-cols-[72px_minmax(0,600px)]
        xl:grid-cols-[275px_minmax(0,600px)_350px]
      "
    >
      {/* LEFT */}
      <header className="h-full min-w-0">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      </header>

      {/* MIDDLE: the only scroller */}
      <main className="no-scrollbar h-full min-w-0 overflow-y-auto overflow-x-hidden border-x border-gray-800">
        {currentPage === "profile" ? (
          <ProfilePage />
        ) : currentPage === "notifications" ? (
          <Notifications userId={userId} />
        ) : currentPage === "more" ? (
          <LanguageDropdown userId={userId} />
        ) : (
          children
        )}
      </main>

      {/* RIGHT: only on xl+ */}
      <aside className="no-scrollbar hidden h-full min-w-0 overflow-y-auto pl-6 xl:block">
        <RightSidebar />
      </aside>
    </div>
  </div>
);
}

export default Mainlayout