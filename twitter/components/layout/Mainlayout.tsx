"use client";
import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Loadingspinner from '@/components/Loading-spinner';
import Sidebar from '@/components/layout/Sidebar';
import RightSidebar from '@/components/layout/Rightsidebar';
import ProfilePage from '@/components/ProfilePgae';
import NotificationSetings from '@/components/NotificationSetings';


const Mainlayout = ({ children }: any) => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-4xl font-bold mb-4"></div>
          <Loadingspinner />
        </div>
      </div>
    )
  }

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <RightSidebar />

      <div className="flex flex-1 justify-center">
        <div className="w-16 sm:w-20 md:w-64 shrink-0 border-r border-gray-800">
          <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        </div>

        <main className="flex-1 min-w-0 w-full max-w-2xl flex flex-col px-2 sm:px-4 lg:px-8 border-x border-gray-800 pb-14 sm:pb-16 md:pb-0">
          {currentPage === "profile" ? (
            <ProfilePage />
          ) : currentPage === "notifications" ? (
            <NotificationSetings />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  )
}

export default Mainlayout