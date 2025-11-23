import fetch from "node-fetch";

// --- Helper: single search call (one "page") ---
async function searchSteamSinglePage(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(
    trimmed
  )}&cc=us&l=en&page=1`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error("Steam search HTTP error:", res.status);
    return [];
  }

  const data = await res.json();
  const items = Array.isArray(data.items) ? data.items : [];

  return items.map((item) => ({
    appid: item.id,
    name: item.name,
  }));
}

// --- Public: searchSteamGames(query, limit) ---
// Used when the user types a search term.
// We just do one call and slice, no filtering by "owned".
export async function searchSteamGames(query, limit = 50) {
  if (!query || !query.trim()) {
    // If no query, let fetchTopSteamGames handle it instead.
    return fetchTopSteamGames(limit);
  }

  const results = await searchSteamSinglePage(query);
  return results.slice(0, limit);
}

// --- Public: fetchTopSteamGames(limit) ---
// Used for "top" recommendations when there's no search query.
// We call multiple generic terms and merge the results.
export async function fetchTopSteamGames(limit = 50) {
  const genericQueries = ["a", "e", "i", "o", "u", "s", "r"];
  const seen = new Set();
  const combined = [];

  for (const q of genericQueries) {
    const pageResults = await searchSteamSinglePage(q);

    for (const g of pageResults) {
      const key = String(g.appid);
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(g);
      }
      if (combined.length >= limit) break;
    }

    if (combined.length >= limit) break;
  }

  return combined.slice(0, limit);
}
