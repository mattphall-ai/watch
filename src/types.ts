export type MediaType = "movie" | "tv";

export interface SearchResultItem {
  id: number;
  mediaType: MediaType;
  title: string;
  year: string;
  posterUrl: string | null;
}

export interface AvailabilityInfo {
  streamOn: string[];
  rentOn: string[];
}

export interface MediaDetails {
  id: number;
  mediaType: MediaType;
  title: string;
  year: string;
  posterUrl: string | null;
  tmdbScore: number | null;
  availability: AvailabilityInfo;
}

export interface WatchListItem {
  id: number;
  mediaType: MediaType;
  title: string;
  year: string;
  posterUrl: string | null;
  tmdbScore: number | null;
  availability: AvailabilityInfo;
  watched: boolean;
  addedAt: number;
}
