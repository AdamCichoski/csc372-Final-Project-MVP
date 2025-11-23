import dotenv from "dotenv";
import fetch from "node-fetch"; 

dotenv.config();

const STEAM_API_KEY = process.env.STEAM_API_KEY;

export async function getSteamGameDetails(appId) {
  const url = `https://store.steampowered.com/api/appdetails?appids=${appId}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Steam API error");
  const data = await res.json();
  return data[appId]?.data || null;
}

export async function searchSteamGames(query) {
  const searchUrl = `https://store.steampowered.com/api/storesearch?term=${encodeURIComponent(
    query
  )}&l=english&cc=US`;

  const res = await fetch(searchUrl);
  if (!res.ok) throw new Error("Steam API error");
  const data = await res.json();
  return data.items || [];
}
