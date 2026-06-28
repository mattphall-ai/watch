import { useEffect, useState } from "react";
import type { MediaDetails, MediaType, SearchResultItem } from "../types";
import { getMediaDetails, searchMedia } from "../api/tmdb";

interface Props {
  mediaType: MediaType;
  onAdd: (media: MediaDetails) => void;
  isInList: (id: number) => boolean;
}

export function SearchPanel({ mediaType, onAdd, isInList }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsCache, setDetailsCache] = useState<Record<number, MediaDetails>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setError(null);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      searchMedia(trimmed, mediaType)
        .then((r) => setResults(r))
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [query, mediaType]);

  async function handleExpand(item: SearchResultItem) {
    if (expandedId === item.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(item.id);
    if (!detailsCache[item.id]) {
      try {
        const details = await getMediaDetails(item.id, mediaType);
        setDetailsCache((prev) => ({ ...prev, [item.id]: details }));
      } catch (e) {
        setError((e as Error).message);
      }
    }
  }

  return (
    <div className="search-panel">
      <input
        className="search-input"
        type="search"
        placeholder={mediaType === "movie" ? "Search films..." : "Search TV shows..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <p className="status-text">Searching...</p>}
      {error && <p className="status-text error">{error}</p>}
      <ul className="result-list">
        {results.map((item) => {
          const details = detailsCache[item.id];
          const expanded = expandedId === item.id;
          const inList = isInList(item.id);
          return (
            <li key={item.id} className="result-item">
              <button className="result-row" onClick={() => handleExpand(item)}>
                {item.posterUrl ? (
                  <img className="poster-thumb" src={item.posterUrl} alt="" />
                ) : (
                  <div className="poster-thumb poster-placeholder" />
                )}
                <span className="result-title">
                  {item.title} {item.year && <span className="result-year">({item.year})</span>}
                </span>
              </button>
              {expanded && (
                <div className="result-detail">
                  {!details ? (
                    <p className="status-text">Loading details...</p>
                  ) : (
                    <>
                      <p className="score-line">
                        TMDB score:{" "}
                        {details.tmdbScore !== null ? `${details.tmdbScore}/10` : "N/A"}
                      </p>
                      <div className="provider-list">
                        {details.providers.length === 0 ? (
                          <span className="status-text">No streaming providers found</span>
                        ) : (
                          details.providers.map((p) => (
                            <img
                              key={p.id}
                              className="provider-logo"
                              src={p.logoUrl}
                              alt={p.name}
                              title={p.name}
                            />
                          ))
                        )}
                      </div>
                      <button
                        className="add-button"
                        disabled={inList}
                        onClick={() => onAdd(details)}
                      >
                        {inList ? "Added" : "Add to watch list"}
                      </button>
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
