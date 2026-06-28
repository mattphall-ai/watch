import { useState } from "react";
import type { MediaType } from "./types";
import { useWatchList } from "./hooks/useWatchList";
import { SearchPanel } from "./components/SearchPanel";
import { WatchListPanel } from "./components/WatchListPanel";
import "./index.css";

function MediaTab({ mediaType }: { mediaType: MediaType }) {
  const { items, add, remove, toggle, isInList } = useWatchList(mediaType);

  return (
    <div className="tab-content">
      <SearchPanel mediaType={mediaType} onAdd={add} isInList={isInList} />
      <h2 className="section-heading">My Watch List</h2>
      <WatchListPanel items={items} onToggle={toggle} onRemove={remove} />
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<MediaType>("movie");

  return (
    <div className="app">
      <header className="app-header">
        <h1>Watch</h1>
      </header>
      <main className="app-main">
        <MediaTab mediaType={activeTab} />
      </main>
      <nav className="tab-bar">
        <button
          className={activeTab === "movie" ? "active" : ""}
          onClick={() => setActiveTab("movie")}
        >
          Films
        </button>
        <button
          className={activeTab === "tv" ? "active" : ""}
          onClick={() => setActiveTab("tv")}
        >
          TV Shows
        </button>
      </nav>
    </div>
  );
}
