import { useState } from "react";
import type { MediaType } from "./types";
import { useWatchList } from "./hooks/useWatchList";
import { SearchPanel } from "./components/SearchPanel";
import { WatchListPanel } from "./components/WatchListPanel";
import "./index.css";

type Area = "search" | "watchlist";

function SearchArea({ mediaType }: { mediaType: MediaType }) {
  const { add, isInList } = useWatchList(mediaType);
  return <SearchPanel mediaType={mediaType} onAdd={add} isInList={isInList} />;
}

function WatchListArea({ mediaType }: { mediaType: MediaType }) {
  const { items, remove, toggle } = useWatchList(mediaType);
  return <WatchListPanel items={items} onToggle={toggle} onRemove={remove} />;
}

export default function App() {
  const [area, setArea] = useState<Area>("search");
  const [mediaType, setMediaType] = useState<MediaType>("movie");

  return (
    <div className="app">
      <header className="app-header">
        <h1>Watch</h1>
      </header>
      <div className="media-switch">
        <button
          className={mediaType === "movie" ? "active" : ""}
          onClick={() => setMediaType("movie")}
        >
          Films
        </button>
        <button
          className={mediaType === "tv" ? "active" : ""}
          onClick={() => setMediaType("tv")}
        >
          TV Shows
        </button>
      </div>
      <main className="app-main">
        {area === "search" ? (
          <SearchArea mediaType={mediaType} />
        ) : (
          <WatchListArea mediaType={mediaType} />
        )}
      </main>
      <nav className="tab-bar">
        <button className={area === "search" ? "active" : ""} onClick={() => setArea("search")}>
          Search
        </button>
        <button
          className={area === "watchlist" ? "active" : ""}
          onClick={() => setArea("watchlist")}
        >
          Watch List
        </button>
      </nav>
    </div>
  );
}
