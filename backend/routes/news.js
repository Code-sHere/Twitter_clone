import express from "express";

const router = express.Router();

let cache = { data: [], fetchedAt: 0 };
const TTL = 30 * 60 * 1000; // 30 minutes

router.get("/", async (req, res) => {
    try {
        if (Date.now() - cache.fetchedAt < TTL && cache.data.length > 0) {
            return res.json({ data: cache.data });
        }

        const r = await fetch(`https://gnews.io/api/v4/top-headlines?country=in&lang=en&max=10&apikey=${process.env.NEWS_API_KEY}`);

        if (!r.ok) {
            return res.json({ data: cache.data });
        }

        const json = await r.json();
        cache = {
            data: (json.articles ?? []).map((a) => (
                {
                    title: a.title,
                    url: a.url,
                    publishedAt: a.publishedAt,
                    source: a.source?.name
                }
            )),
            fetchedAt: Date.now(),
        };
        res.json({ data: cache.data });

    } catch (error) {
        res.json({ data: cache.data });
    }
});

export default router;