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
  const [detailsById, setDetailsById] = useState<Record<number, MediaDetails>>({});

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setDetailsById({});
      setError(null);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      setDetailsById({});
      searchMedia(trimmed, mediaType)
        .then((r) => {
          setResults(r);
          for (const item of r) {
            getMediaDetails(item.id, mediaType)
              .then((details) =>
                setDetailsById((prev) => ({ ...prev, [item.id]: details }))
              )
              .catch(() => {});
          }
        })
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [query, mediaType]);

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
          const details = detailsById[item.id];
          const inList = isInList(item.id);
          return (
            <li key={item.id} className="result-item">
              <div className="result-row">
                {item.posterUrl ? (
                  <img className="poster-thumb" src={item.posterUrl} alt="" />
                ) : (
                  <div className="poster-thumb poster-placeholder" />
                )}
                <div className="result-info">
                  <span className="result-title">
                    {item.title} {item.year && <span className="result-year">({item.year})</span>}
                  </span>
                  {!details ? (
                    <span className="status-text">Loading...</span>
                  ) : (
                    <>
                      <span className="score-line">
                        TMDB score:{" "}
                        {details.tmdbScore !== null ? `${details.tmdbScore}/10` : "N/A"}
                      </span>
                      <div className="provider-list">
                        {details.providers.length === 0 ? (
                          <span className="status-text">Not currently streaming</span>
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
                    </>
                  )}
                </div>
                <button
                  className="add-button"
                  disabled={!details || inList}
                  onClick={() => details && onAdd(details)}
                >
                  {inList ? "Added" : "Add"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
