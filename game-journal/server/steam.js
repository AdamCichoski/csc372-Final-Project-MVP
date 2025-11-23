import fetch from "node-fetch";

export async function fetchTopSteamGames(limit = 50) {
  const url = "https://store.steampowered.com/api/featured";

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Steam featured failed: ${res.status}`);
  }

  const data = await res.json();

  const games = (data.featured_win || []).slice(0, limit).map((g) => ({
    appid: g.id,
    name: g.name,
  }));

  return games;
}

export async function searchSteamGames(query, limit = 50) {
  if (!query || !query.trim()) {
    return fetchTopSteamGames(limit);
  }

  const searchUrl = `https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(
    query
  )}`;

  const res = await fetch(searchUrl);
  if (!res.ok) {
    throw new Error(`Steam search failed: ${res.status}`);
  }

  const data = await res.json(); // [{ appid, name, icon }, ...]

  return data.slice(0, limit).map((g) => ({
    appid: g.appid,
    name: g.name,
  }));
}
