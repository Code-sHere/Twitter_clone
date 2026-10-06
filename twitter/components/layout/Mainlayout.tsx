"use client";
import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Loadingspinner from '@/components/Loading-spinner';
import Sidebar from '@/components/layout/Sidebar';
import RightSidebar from '@/components/layout/Rightsidebar';
import ProfilePage from '@/components/ProfilePgae';
import Notifications from '@/components/Notifications';
import LanguageDropdown from '@/components/LanguageDropdown';
import Explore from '@/components/Explore';


const Mainlayout = ({ children }: any) => {
  const { isLoading } = useAuth();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedProfileUsername, setSelectedProfileUsername] =
    useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const goSearch = (query: string) => {
    setSearchQuery(query)
    setSelectedProfileUsername(null);
    setCurrentPage("explore");
  };

  const openProfile = (username: string) => {
    if (!username) return;
    setSelectedProfileUsername(username);
  };

  const closeProfile = () => {
    setSelectedProfileUsername(null);
  };

  // pass openprofile into feed
  const renderHome = () => {
    if (!React.isValidElement(children)) {
      return children;
    }

    return React.cloneElement(
      children as React.ReactElement<any>,
      {
        onOpenProfile: openProfile,
      }
    );
  };


  const userId = user._id;

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
          <Sidebar currentPage={currentPage} onNavigate={(page: string) => {
            setSelectedProfileUsername(null);
            setCurrentPage(page);
          }} />
        </header>

        {/* MIDDLE: the only scroller */}
        <main className="no-scrollbar h-full min-w-0 overflow-y-auto overflow-x-hidden border-x border-gray-800">

          {selectedProfileUsername ? (
            <ProfilePage
              username={selectedProfileUsername}
              onBack={closeProfile}
            />

          ) : currentPage === "profile" ? (
            <ProfilePage />

          ) : currentPage === "notifications" ? (
            <Notifications userId={userId} />

          ) : currentPage === "more" ? (
            <LanguageDropdown userId={userId} />

          ) : currentPage === "explore" ? (
            <Explore initalQuery={searchQuery} />

          ) : (
            renderHome()
          )}

        </main>

        {/* RIGHT: only on xl+ */}
        <aside className="no-scrollbar hidden h-full min-w-0 overflow-y-auto pl-6 xl:block">
          <RightSidebar onSearch={goSearch} />
        </aside>
      </div>
    </div>
  );
}

export default Mainlayout