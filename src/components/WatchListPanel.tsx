import type { WatchListItem } from "../types";

interface Props {
  items: WatchListItem[];
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
}

export function WatchListPanel({ items, onToggle, onRemove }: Props) {
  if (items.length === 0) {
    return <p className="status-text">Your watch list is empty.</p>;
  }

  const sorted = [...items].sort((a, b) => Number(a.watched) - Number(b.watched));

  return (
    <ul className="watchlist">
      {sorted.map((item) => (
        <li key={item.id} className={`watchlist-item ${item.watched ? "watched" : ""}`}>
          <label className="watchlist-row">
            <input
              type="checkbox"
              checked={item.watched}
              onChange={() => onToggle(item.id)}
            />
            {item.posterUrl ? (
              <img className="poster-thumb" src={item.posterUrl} alt="" />
            ) : (
              <div className="poster-thumb poster-placeholder" />
            )}
            <div className="result-info">
              <span className="result-title">
                {item.title} {item.year && <span className="result-year">({item.year})</span>}
              </span>
              <div className="provider-list">
                {item.providers.length === 0 ? (
                  <span className="status-text">Not currently streaming</span>
                ) : (
                  item.providers.map((p) => (
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
            </div>
          </label>
          <button className="remove-button" onClick={() => onRemove(item.id)} aria-label="Remove">
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
