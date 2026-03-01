import type { Handler } from "@netlify/functions";

const NEWS_API_KEY = process.env.NEWS_API_KEY;

export const handler: Handler = async (event) => {
  try {
    if (!NEWS_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing NEWS_API_KEY in Netlify environment variables." }),
      };
    }

    const q = event.queryStringParameters?.q || "technology";
    const countRaw = event.queryStringParameters?.count || "4";
    const count = Math.min(10, Math.max(1, Number(countRaw) || 4));

    const url =
      "https://newsapi.org/v2/everything" +
      `?q=${encodeURIComponent(q)}` +
      `&language=en` +
      `&pageSize=${encodeURIComponent(String(count))}` +
      `&sortBy=publishedAt` +
      `&apiKey=${encodeURIComponent(NEWS_API_KEY)}`;

    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({
          error: data?.message || `NewsAPI error (HTTP ${res.status})`,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ articles: data?.articles || [] }),
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e?.message || "Server error fetching news." }),
    };
  }
};
