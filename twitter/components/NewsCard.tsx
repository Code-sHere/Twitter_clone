"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

type Article = {
    title: string,
    url: string,
    publishedAt: string,
    source: string
};

const timeAgo = (iso: string) => {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 60) return `${Math.max(mins, 1)} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hours ago`;
    return `${Math.floor(hrs / 24)} days ago`;
};

export default function NewsCard() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [hidden, setHidden] = useState(false);

    const { t } = useTranslation();

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/news`).then((res) => res.json()).then((json) => setArticles((json.data ?? []).slice(0, 3))).catch(() => setArticles([])).finally(() => setLoading(false));
    }, []);

    if (hidden || (!loading && articles.length === 0)) return null;

    return (
        <section className="mb-4 rounded-2xl border border-gray-800 p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold">Today’s News</h2>
                <button onClick={() => setHidden(true)} aria-label="Close">
                    <X className="h-4 w-4" />
                </button>
            </div>

            {loading && <p className="mt-4 text-sm text-gray-500">Loading…</p>}

            {articles.map((a) => (
                <a
                    key={a.url}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 block hover:opacity-80"
                >
                    <p className="font-bold leading-snug">{a.title}</p>
                    <p className="mt-1 text-sm text-gray-500">
                        {timeAgo(a.publishedAt)} · News · {a.source}
                    </p>
                </a>
            ))}
        </section>
    );

}