export type MediaType = "movie" | "tv";

export interface SearchResultItem {
  id: number;
  mediaType: MediaType;
  title: string;
  year: string;
  posterUrl: string | null;
}

export interface Provider {
  id: number;
  name: string;
  logoUrl: string;
}

export interface MediaDetails {
  id: number;
  mediaType: MediaType;
  title: string;
  year: string;
  posterUrl: string | null;
  tmdbScore: number | null;
  providers: Provider[];
}

export interface WatchListItem {
  id: number;
  mediaType: MediaType;
  title: string;
  year: string;
  posterUrl: string | null;
  tmdbScore: number | null;
  watched: boolean;
  addedAt: number;
}
