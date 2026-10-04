"use client";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

type UserResult = { _id: string; displayName: string; username: string; avatar?: string };
type TweetResult = {
    _id: string; content: string; createdAt: string;
    author?: { displayName: string; username: string; avatar?: string }
};

const Avatar = ({ src, name }: { src?: string; name?: string }) => (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-600 font-semibold">
        {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : name?.[0]?.toUpperCase()}
    </div>
);

export default function Explore({ initalQuery = "" }: { initalQuery?: string}) {
    const [query, setQuery] = useState(initalQuery);
    const [tab, setTab] = useState<"tweets" | "people">("tweets");

    const [users, setUsers] = useState<UserResult[]>([]);
    const [tweets, setTweets] = useState<TweetResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => setQuery(initalQuery), [initalQuery]);

    // when the sidebar search sends a new query , update the box
    useEffect(() => {

        const term = query.trim();
        if (!term) {
            setUsers([]);
            setTweets([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const controller = new AbortController();

        // debounceing wait 300ms after user stop tying

        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`${API}/api/explore/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });

                if (!res.ok) throw new Error(res.statusText);
                const json = await res.json();
                setUsers(json.users ?? []);
                setTweets(json.tweets ?? []);
            } catch (error: any) {
                if (error.name !== "AbortError") console.error(error);
                setUsers([]);
                setTweets([]);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            controller.abort();
        }
    }, [query]);

    const term = query.trim();

    return (
        <div>
            {/* sticky header: search box + tabs */}
            <div className="sticky top-0 z-10 bg-black/90 px-4 pt-3 backdrop-blur">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search"
                        autoFocus
                        className="h-11 w-full rounded-full border border-gray-800 bg-black pl-11 pr-10 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            aria-label="Clear"
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-blue-500 p-1"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>

                <div className="mt-2 flex">
                    {(["tweets", "people"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 border-b-4 py-3 capitalize hover:bg-gray-900 ${tab === t ? "border-blue-500 font-bold" : "border-transparent text-gray-500"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* states */}
            {!term && <p className="p-6 text-center text-gray-500">Search for people and posts</p>}
            {term && loading && <p className="p-6 text-center text-gray-500">Searching…</p>}

            {/* people */}
            {term && !loading && tab === "people" && (
                <>
                    {users.length === 0 && (
                        <p className="p-6 text-center text-gray-500">No people found for “{term}”</p>
                    )}
                    {users.map((u) => (
                        <div key={u._id} className="flex items-center gap-3 border-b border-gray-800 p-4 hover:bg-gray-900/50">
                            <Avatar src={u.avatar} name={u.displayName} />
                            <div className="min-w-0">
                                <p className="truncate font-bold">{u.displayName}</p>
                                <p className="truncate text-sm text-gray-500">@{u.username}</p>
                            </div>
                        </div>
                    ))}
                </>
            )}

            {/* posts */}
            {term && !loading && tab === "tweets" && (
                <>
                    {tweets.length === 0 && (
                        <p className="p-6 text-center text-gray-500">No posts found for “{term}”</p>
                    )}
                    {tweets.map((p) => (
                        <div key={p._id} className="flex gap-3 border-b border-gray-800 p-4 hover:bg-gray-900/50">
                            <Avatar src={p.author?.avatar} name={p.author?.displayName} />
                            <div className="min-w-0">
                                <p className="truncate font-bold">
                                    {p.author?.displayName}{" "}
                                    <span className="font-normal text-gray-500">@{p.author?.username}</span>
                                </p>
                                <p className="mt-1 break-words">{p.content}</p>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}