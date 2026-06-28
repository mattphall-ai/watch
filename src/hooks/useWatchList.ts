import { useEffect, useState } from "react";
import type { MediaDetails, MediaType, WatchListItem } from "../types";
import {
  addToWatchList,
  loadWatchList,
  removeFromWatchList,
  saveWatchList,
  toggleWatched,
} from "../storage/watchlist";

export function useWatchList(mediaType: MediaType) {
  const [items, setItems] = useState<WatchListItem[]>([]);

  useEffect(() => {
    setItems(loadWatchList().filter((i) => i.mediaType === mediaType));
  }, [mediaType]);

  function persist(updateAll: (all: WatchListItem[]) => WatchListItem[]) {
    const all = loadWatchList();
    const next = updateAll(all);
    saveWatchList(next);
    setItems(next.filter((i) => i.mediaType === mediaType));
  }

  return {
    items,
    add: (media: MediaDetails) => persist((all) => addToWatchList(all, media)),
    remove: (id: number) => persist((all) => removeFromWatchList(all, id, mediaType)),
    toggle: (id: number) => persist((all) => toggleWatched(all, id, mediaType)),
    isInList: (id: number) => items.some((i) => i.id === id),
  };
}
