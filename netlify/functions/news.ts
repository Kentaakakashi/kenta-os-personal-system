import type { Handler } from "@netlify/functions";

type NewsItem = {
  title: string;
  source?: string;
  url?: string;
  publishedAt?: string;
};

export const handler: Handler = async (event) => {
  try {
    const apiKey = process.env.NEWS_API_KEY || process.env.VITE_NEWS_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          items: [],
          error: "Missing NEWS_API_KEY in Netlify environment variables.",
        }),
      };
    }

    const qRaw = event.queryStringParameters?.q || "";
    const os = event.queryStringParameters?.os || "kenta";
    const countRaw =
      event.queryStringParameters?.pageSize ||
      event.queryStringParameters?.count ||
      "4";
    const count = Math.min(10, Math.max(1, Number(countRaw) || 4));

    const pageRaw = event.queryStringParameters?.page || "1";
    const page = Math.min(5, Math.max(1, Number(pageRaw) || 1));

    // Always prefer "everything" when q exists
    const q = qRaw.trim();
    const base =
      q.length > 0
        ? "https://newsapi.org/v2/everything?"
        : "https://newsapi.org/v2/top-headlines?";

    // If q is empty, top-headlines (India) at least gives something sane.
    const url =
      base +
      (q.length > 0
        ? `q=${encodeURIComponent(q)}&language=en&sortBy=publishedAt`
        : `country=in`) +
      `&pageSize=${encodeURIComponent(String(count))}` +
      `&page=${encodeURIComponent(String(page))}` +
      `&apiKey=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({
          items: [],
          error: data?.message || "News API request failed",
        }),
      };
    }

    const articles = Array.isArray(data.articles) ? data.articles : [];
    const items: NewsItem[] = articles
      .filter((a: any) => a?.title)
      .map((a: any) => ({
        title: a.title,
        source: a?.source?.name,
        url: a.url,
        publishedAt: a.publishedAt,
      }));

    // Tiny OS-specific nudge if everything is too broad.
    // (Not filtering hard, just biasing by leaving query to the widget.)
    // Keeping this minimal so your settings actually matter.
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({ items, os }),
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        items: [],
        error: e?.message || "Unknown error",
      }),
    };
  }
};
