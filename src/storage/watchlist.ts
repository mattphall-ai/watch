import type { MediaDetails, WatchListItem } from "../types";

const STORAGE_KEY = "watchlist:v1";

export function loadWatchList(): WatchListItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WatchListItem[]) : [];
  } catch {
    return [];
  }
}

export function saveWatchList(items: WatchListItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addToWatchList(items: WatchListItem[], media: MediaDetails): WatchListItem[] {
  const exists = items.some((i) => i.id === media.id && i.mediaType === media.mediaType);
  if (exists) return items;
  const newItem: WatchListItem = {
    id: media.id,
    mediaType: media.mediaType,
    title: media.title,
    year: media.year,
    posterUrl: media.posterUrl,
    tmdbScore: media.tmdbScore,
    availability: media.availability,
    watched: false,
    addedAt: Date.now(),
  };
  return [...items, newItem];
}

export function removeFromWatchList(items: WatchListItem[], id: number, mediaType: string): WatchListItem[] {
  return items.filter((i) => !(i.id === id && i.mediaType === mediaType));
}

export function toggleWatched(items: WatchListItem[], id: number, mediaType: string): WatchListItem[] {
  return items.map((i) =>
    i.id === id && i.mediaType === mediaType ? { ...i, watched: !i.watched } : i
  );
}
