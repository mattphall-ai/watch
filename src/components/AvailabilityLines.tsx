import type { AvailabilityInfo } from "../types";

export function AvailabilityLines({ availability }: { availability: AvailabilityInfo | undefined }) {
  const { streamOn, rentOn } = availability ?? { streamOn: [], rentOn: [] };
  if (streamOn.length === 0 && rentOn.length === 0) {
    return <span className="meta-line muted">Not available to stream or rent</span>;
  }
  return (
    <>
      {streamOn.length > 0 && <span className="meta-line">Stream: {streamOn.join(", ")}</span>}
      {rentOn.length > 0 && <span className="meta-line">Rent: {rentOn.join(", ")}</span>}
    </>
  );
}
