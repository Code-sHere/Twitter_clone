"use client";

import Image from "next/image";
import LandingPage from "@/components/LandingPage";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Mainlayout from "@/components/layout/Mainlayout";

export default function Home() {
  const { user } = useAuth();
  return (
    <AuthProvider>
      <Mainlayout>
        {" "}
        <LandingPage />
      </Mainlayout>
    </AuthProvider>
  );
}
