"use client";
import React,{useState} from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import NewsCard from '@/components/NewsCard';

const news = [
  { title: "Indian Pilot's Bravery Thwarts Terror Attempt on FlyDubai Flight", meta: "2 days ago · News · 1.1M posts" },
  { title: "Elon Musk Renames SpaceX AI to SpaceXSI Following Trump Order", meta: "6 hours ago · News · 65.5K posts" },
  { title: "Thackeray Brothers Lead Massive Mumbai March Against Voter Roll Revision", meta: "9 hours ago · News · 47.3K posts" },
];

const Card = ({ children }: { children: React.ReactNode }) => (
  <section className="mb-4 rounded-2xl border border-gray-800 p-4">{children}</section>
);



export default function RightSidebar({onSearch} : {onSearch: (query: string) => void}) {

  const [value, setValue] = useState("");

  const submit = () =>{
    if(value.trim()) onSearch?.(value.trim());
  }

  return (
    <div className="pb-6">
      {/* Search stays at top of the column */}
      <div className="sticky top-0 z-10 bg-black py-1">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            placeholder="Search"
            className="h-11 w-full rounded-full border border-gray-800 bg-black pl-11 pr-4 text-white placeholder-gray-500 outline-none focus:border-blue-500"
            value={value}
            onChange={(e)=>setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>
      </div>

      <div className="mt-3">
        <Card>
          <h2 className="text-xl font-extrabold">Subscribe to Premium</h2>
          <p className="mt-2 text-[15px] text-gray-200">
            Get rid of ads, see your analytics, boost your replies and unlock 20+ features.
          </p>
          <Link
            href="/plans"
            className="mt-3 inline-block rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
          >
            Subscribe
          </Link>
        </Card>

        <NewsCard />

        <Card>
          <h2 className="text-xl font-extrabold">What’s happening</h2>
          <p className="mt-3 text-sm text-gray-500">Trending in India</p>
          <p className="font-bold">#kpssönlisans</p>
        </Card>
      </div>
    </div>
  );
}