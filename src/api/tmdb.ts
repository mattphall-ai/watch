import type { MediaDetails, MediaType, Provider, SearchResultItem } from "../types";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

// TMDB watch provider region used for the streaming availability lookup.
const WATCH_REGION = "US";

function assertApiKey() {
  if (!API_KEY) {
    throw new Error(
      "Missing TMDB API key. Set VITE_TMDB_API_KEY in a .env file (see .env.example)."
    );
  }
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  assertApiKey();
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_key", API_KEY!);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

interface TmdbSearchResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  media_type?: string;
}

export async function searchMedia(query: string, mediaType: MediaType): Promise<SearchResultItem[]> {
  if (!query.trim()) return [];
  const path = mediaType === "movie" ? "/search/movie" : "/search/tv";
  const data = await tmdbFetch<{ results: TmdbSearchResult[] }>(path, { query });
  return data.results.map((item) => toSearchResultItem(item, mediaType));
}

function toSearchResultItem(item: TmdbSearchResult, mediaType: MediaType): SearchResultItem {
  const dateStr = mediaType === "movie" ? item.release_date : item.first_air_date;
  return {
    id: item.id,
    mediaType,
    title: (item.title ?? item.name ?? "Untitled").trim(),
    year: dateStr ? dateStr.slice(0, 4) : "",
    posterUrl: item.poster_path ? `${IMAGE_BASE}${item.poster_path}` : null,
  };
}

interface TmdbWatchProvidersResponse {
  results: Record<
    string,
    {
      flatrate?: TmdbProvider[];
      ads?: TmdbProvider[];
      free?: TmdbProvider[];
    }
  >;
}

interface TmdbProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface TmdbDetailsResponse {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  vote_average?: number;
}

export async function getMediaDetails(id: number, mediaType: MediaType): Promise<MediaDetails> {
  const detailsPath = mediaType === "movie" ? `/movie/${id}` : `/tv/${id}`;
  const providersPath = `${detailsPath}/watch/providers`;

  const [details, watchProviders] = await Promise.all([
    tmdbFetch<TmdbDetailsResponse>(detailsPath),
    tmdbFetch<TmdbWatchProvidersResponse>(providersPath),
  ]);

  const regionData = watchProviders.results[WATCH_REGION];
  const providerList = [
    ...(regionData?.flatrate ?? []),
    ...(regionData?.free ?? []),
    ...(regionData?.ads ?? []),
  ];

  const seen = new Set<number>();
  const providers: Provider[] = [];
  for (const p of providerList) {
    if (seen.has(p.provider_id)) continue;
    seen.add(p.provider_id);
    providers.push({
      id: p.provider_id,
      name: p.provider_name,
      logoUrl: `${IMAGE_BASE}${p.logo_path}`,
    });
  }

  const dateStr = mediaType === "movie" ? details.release_date : details.first_air_date;

  return {
    id: details.id,
    mediaType,
    title: (details.title ?? details.name ?? "Untitled").trim(),
    year: dateStr ? dateStr.slice(0, 4) : "",
    posterUrl: details.poster_path ? `${IMAGE_BASE}${details.poster_path}` : null,
    tmdbScore: details.vote_average ? Math.round(details.vote_average * 10) / 10 : null,
    providers,
  };
}
