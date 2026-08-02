export interface StreamSource {
  name: string;
  url: string;
  type: 'embed' | 'trailer' | 'stream';
}

export interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  episodeNumber: number;
  seasonNumber: number;
  thumbnailUrl: string;
  videoUrl: string;
  embedUrl?: string;
  sources?: StreamSource[];
}

export interface CastMember {
  name: string;
  character?: string;
  profileUrl?: string | null;
}

export interface Movie {
  id: string;
  tmdbId?: string;
  imdbId?: string;
  title: string;
  originalTitle?: string;
  description: string;
  longDescription?: string;
  backdropUrl: string;
  posterUrl: string;
  logoUrl?: string;
  trailerUrl: string;
  videoUrl: string;
  embedUrl?: string;
  sources?: StreamSource[];
  matchScore: number;
  releaseYear: number;
  releaseDate?: string;
  isUpcoming?: boolean;
  isRecentlyAdded?: boolean;
  isLeavingSoon?: boolean;
  maturityRating: 'TV-MA' | 'TV-14' | 'PG-13' | 'PG' | 'R' | 'G' | 'NR';
  duration: string;
  isSeries: boolean;
  isAnime?: boolean;
  seasonsCount?: number;
  episodes?: Episode[];
  /** Episode selected from the details view; used for an explicit Next action. */
  nextEpisode?: Episode;
  genres: string[];
  cast: (string | CastMember)[];
  director: string;
  isOriginal?: boolean;
  isTrending?: boolean;
  isPopular?: boolean;
  isTop10?: boolean;
  top10Rank?: number;
  tags: string[];
  audioLanguages: string[];
  subtitleLanguages: string[];
  platform?: string;
  /** Populated by search — which platforms carry this title (e.g. ['Netflix', 'Prime Video']) */
  availablePlatforms?: string[];
  watchProgress?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  movies: Movie[];
}

export interface Actor {
  id: string;
  name: string;
  profileUrl: string;
  knownFor: string;
}

export interface SearchResponse {
  movies: Movie[];
  actor?: Actor;
}

export interface UserPreferences {
  /** Interface text. Never used to hide catalog titles or playback tracks. */
  uiLanguage: string;
  /** Languages used to rank discovery rails and choose playback defaults. */
  preferredAudioLanguages: string[];
  preferredSubtitleLanguages: string[];
  dubOption: 'all' | 'dubbed_only' | 'subtitled_only' | 'dual_audio';
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  isKids: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  profiles: UserProfile[];
  currentProfileId: string;
  myList: string[];
  /** Preferences are profile-scoped, so a family can use independent languages. */
  preferencesByProfile?: Record<string, UserPreferences>;
}
