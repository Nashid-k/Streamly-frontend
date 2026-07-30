'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroBanner } from '../components/HeroBanner';
import { MovieRow } from '../components/MovieRow';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { TrailerModal } from '../components/TrailerModal';
import { ProfileModal } from '../components/ProfileModal';
import { OnboardingModal } from '../components/OnboardingModal';
import { MovieCard } from '../components/MovieCard';
import { usePlatform } from '../components/PlatformContext';
import { HeroSkeleton, MovieRowSkeleton, PlatformInitialLoader } from '../components/SkeletonLoaders';
import { motion, AnimatePresence } from 'framer-motion';

import {
  fetchFeaturedMovie,
  fetchCategories,
  fetchTop10Movies,
  fetchMovieById,
  searchMovies,
  fetchUser,
  toggleMyListApi,
  updateUserPreferencesApi,
  switchProfileApi,
  prewarmPlatformCatalogs,
} from '../lib/api';

import { Film, ArrowUp, Filter } from 'lucide-react';
import { Movie, Category, User, UserProfile, UserPreferences, Actor } from '../types';

const HERO_ROTATION_MS = 10_000;

const normalizeGenre = (value: string) => value.trim().toLocaleLowerCase();
const hasGenre = (movie: Movie, selected: string) => {
  if (selected === 'All') return true;
  const normSelected = normalizeGenre(selected);
  if (normSelected === 'popular') {
    return (movie.matchScore >= 70) || (movie.seasonsCount ?? 0) > 0 || (movie.releaseYear >= 2020);
  }
  if (normSelected === 'hotstar specials' || normSelected === 'star plus') {
    return Boolean(movie.isSeries) || Boolean(movie.logoUrl) || Boolean(movie.backdropUrl);
  }
  if (['hindi', 'english', 'tamil', 'telugu', 'malayalam', 'kannada', 'marathi', 'bengali'].includes(normSelected)) {
    const audioMatch = (movie.audioLanguages || []).some(l => normalizeGenre(l) === normSelected);
    const subMatch = (movie.subtitleLanguages || []).some(l => normalizeGenre(l) === normSelected);
    const titleMatch = movie.title.toLowerCase().includes(normSelected) || (movie.originalTitle?.toLowerCase() || '').includes(normSelected);
    return audioMatch || subMatch || titleMatch;
  }
  // Genre check with fallback keyword matching
  const genreMatch = movie.genres.some((genre) => normalizeGenre(genre) === normSelected);
  const keywordMatch = (movie.tags || []).some((tag) => normalizeGenre(tag).includes(normSelected)) ||
                       movie.title.toLowerCase().includes(normSelected) ||
                       (movie.description || '').toLowerCase().includes(normSelected);
  return genreMatch || keywordMatch;
};

function shuffleForDiscovery<T>(items: T[], seedText: string): T[] {
  let seed = 2166136261;
  for (let index = 0; index < seedText.length; index += 1) {
    seed = Math.imul(seed ^ seedText.charCodeAt(index), 16777619);
  }
  const nextRandom = () => {
    seed += 0x6D2B79F5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(nextRandom() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export default function Home() {
  const { platform } = usePlatform();
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [top10Movies, setTop10Movies] = useState<Movie[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchActor, setSearchActor] = useState<Actor | undefined>();
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'movies' | 'series' | 'anime' | 'mylist'>('home');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('All');
  const [selectedLangFilter, setSelectedLangFilter] = useState<string[]>(['All']);
  const [selectedDubFilter, setSelectedDubFilter] = useState<'all' | 'dubbed_only' | 'subtitled_only' | 'dual_audio'>('all');
  const [preferences, setPreferences] = useState<UserPreferences>({
    uiLanguage: 'English', preferredAudioLanguages: [], preferredSubtitleLanguages: [], dubOption: 'all',
  });
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  // A new browser refresh gets a fresh discovery session. Route and profile
  // changes increment the revision below, producing a new but stable ordering.
  const [discoverySessionKey] = useState(() => Date.now().toString(36));
  const [discoveryRevision, setDiscoveryRevision] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroReady, setIsHeroReady] = useState(false);

  
  const handleHeroReady = useCallback(() => {
    setIsHeroReady(true);
  }, []);

  const [activeDetailMovie, setActiveDetailMovie] = useState<Movie | null>(null);
  const [activeVideoMovie, setActiveVideoMovie] = useState<Movie | null>(null);
  const [activeTrailerMovie, setActiveTrailerMovie] = useState<Movie | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [myList, setMyList] = useState<string[]>([]);

  // Toast Notification System
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Continue Watching List
  const [continueWatching, setContinueWatching] = useState<Movie[]>([]);

  // Ref holding the full movie lookup including search results and top10
  const allMoviesMapRef = useRef<Map<string, Movie>>(new Map());

  const handlePlayMovie = (movie: Movie) => {
    // Both Play and Info from the card now open the unified detail modal
    handleOpenDetails(movie);
  };

  // Called from detail modal "Play" button — goes straight to player
  const handleStreamNow = (movie: Movie, episode?: any) => {
    setActiveDetailMovie(null);
    setActiveTrailerMovie(null);
    const movieToPlay = episode ? {
      ...movie,
      sources: episode.sources || movie.sources,
      title: `${movie.title.split(' · ')[0]} · ${episode.title}`,
      tmdbId: movie.tmdbId,
      seasonNumber: episode.seasonNumber,
      episodeNumber: episode.episodeNumber
    } : movie;
    setActiveVideoMovie(movieToPlay as Movie);
    setContinueWatching((prev) => {
      const filtered = prev.filter((m) => m.id !== movie.id);
      return [movie, ...filtered].slice(0, 10);
    });
    showToast(`Streaming "${movieToPlay.title}"`);
  };

  const handleToggleMyListWithToast = async (movieId: string) => {
    // Search allMoviesMapRef first (covers search results + top10 + categories)
    const found = allMoviesMapRef.current.get(movieId);
    const title = found ? found.title : 'Title';
    const isAdding = !myList.includes(movieId);
    await handleToggleMyList(movieId);
    showToast(isAdding ? `Added "${title}" to My Watchlist` : `Removed "${title}" from My Watchlist`);
  };

  const updateUrlParam = (key: string, value: string | null) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    window.history.pushState({}, '', url.toString());
  };

  const handleOpenDetails = (movie: Movie) => {
    setActiveDetailMovie(movie);
    updateUrlParam('title', movie.id);
  };

  const handleCloseDetails = () => {
    setActiveDetailMovie(null);
    updateUrlParam('title', null);
  };

  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

  const handleTabChange = (tab: 'home' | 'movies' | 'series' | 'anime' | 'mylist') => {
    if (tab === activeTab) return;
    setSelectedGenreFilter('All');
    setDiscoveryRevision((revision) => revision + 1);
    setIsTabTransitioning(true);
    setActiveTab(tab);
    updateUrlParam('tab', tab === 'home' ? null : tab);
    setTimeout(() => {
      setIsTabTransitioning(false);
    }, 350);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setShowScrollTop(window.scrollY > 400);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Preference Restoration & Onboarding Trigger
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('nflix_language_preference');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<UserPreferences> & { preferredLanguages?: string[] };
        const preferredLanguages = [...(parsed.preferredAudioLanguages || parsed.preferredLanguages || []), ...(parsed.preferredSubtitleLanguages || [])];
        setSelectedLangFilter(preferredLanguages.length ? Array.from(new Set(preferredLanguages)) : ['All']);
        if (parsed.dubOption) setSelectedDubFilter(parsed.dubOption as any);
      } catch (e) {}
    } else {
      const timer = setTimeout(() => setShowOnboardingModal(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSavePreferences = async (newPrefs: UserPreferences) => {
    const discoveryLanguages = Array.from(new Set([...newPrefs.preferredAudioLanguages, ...newPrefs.preferredSubtitleLanguages]));
    setPreferences(newPrefs);
    setSelectedLangFilter(discoveryLanguages.length ? discoveryLanguages : ['All']);
    setSelectedDubFilter(newPrefs.dubOption);
    if (currentProfile) {
      setUser((current) => current ? {
        ...current,
        preferencesByProfile: { ...(current.preferencesByProfile || {}), [currentProfile.id]: newPrefs },
      } : current);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('nflix_language_preference', JSON.stringify(newPrefs));
    }
    await updateUserPreferencesApi(newPrefs).catch(() => {});
    showToast(`Language settings saved for ${currentProfile?.name || 'this profile'}`);
  };

  const matchesPreferredLanguages = (movie: Movie): boolean => {
    // Preferences rank dedicated discovery rails; they must not make the rest of
    // the catalog, search results, or a title's tracks disappear.
    return true;
  };

  const matchesLanguage = (movie: Movie, language: string): boolean => {
    const lowerLang = language.toLowerCase();
    return movie.audioLanguages?.some((item) => item.toLowerCase().includes(lowerLang)) ||
      movie.subtitleLanguages?.some((item) => item.toLowerCase().includes(lowerLang)) ||
      movie.title.toLowerCase().includes(lowerLang) ||
      movie.originalTitle?.toLowerCase().includes(lowerLang) || false;
  };

  const filterMoviesByPreferences = (list: Movie[]): Movie[] => {
    return list.filter((m) => {
      if (!hasGenre(m, selectedGenreFilter)) return false;
      if (!matchesPreferredLanguages(m)) return false;
      
      // If the movie hasn't been deep-scraped yet (e.g. fresh search results from TMDB),
      // it won't have .sources populated. We should let it pass the dub filter so it doesn't disappear.
      if (!m.sources || m.sources.length === 0) {
        return true;
      }

      if (selectedDubFilter === 'dubbed_only') {
        const hasDub = m.sources?.some((s) => s.name.toLowerCase().includes('dub') || s.name.toLowerCase().includes('audio')) ||
          m.audioLanguages?.some((l) => l.toLowerCase().includes('dub')) ||
          (m.audioLanguages && m.audioLanguages.length > 1);
        if (!hasDub) return false;
      } else if (selectedDubFilter === 'dual_audio') {
        const isDual = m.isAnime || m.sources?.some((s) => s.name.toLowerCase().includes('dual'));
        if (!isDual) return false;
      }
      return true;
    });
  };

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false);
  const [isSwitchingPlatform, setIsSwitchingPlatform] = useState(false);

  useEffect(() => {
    if (!isLoadingPage) {
      setHasCompletedInitialLoad(true);
    }
  }, [isLoadingPage]);
  const [isSwitching, setIsSwitching] = useState(false);

  // Initial Data Fetching & Dynamic Platform Switching Sync
  useEffect(() => {
    let isMounted = true;
    setIsSwitchingPlatform(true);
    
    async function loadData() {
      try {
        const [featuredResult, categoriesResult, top10Result, userResult] = await Promise.allSettled([
          fetchFeaturedMovie(platform),
          fetchCategories(platform),
          fetchTop10Movies(platform),
          fetchUser(),
        ]);

        if (!isMounted) return;

        // The catalog should not disappear because an optional user/profile
        // request failed. Categories are the only required payload; the other
        // rails gracefully fall back to empty data and can be retried later.
        if (categoriesResult.status === 'rejected') throw categoriesResult.reason;
        const feat = featuredResult.status === 'fulfilled' ? featuredResult.value : null;
        const cats = categoriesResult.value;
        const top10 = top10Result.status === 'fulfilled' ? top10Result.value : [];
        const userData = userResult.status === 'fulfilled' ? userResult.value : null;
        if (featuredResult.status === 'rejected' || top10Result.status === 'rejected' || userResult.status === 'rejected') {
          setCatalogError('Some optional catalog data is unavailable. Showing the available titles.');
        }

        setFeaturedMovie(feat);
        setCategories(cats);
        setTop10Movies(top10);

        const movieMap = new Map<string, Movie>();
        cats.forEach((cat) => cat.movies.forEach((m) => movieMap.set(m.id, m)));
        top10.forEach((m) => movieMap.set(m.id, m));
        if (feat) movieMap.set(feat.id, feat);

        const allMovieItems = Array.from(movieMap.values());
        setAllMovies(allMovieItems);
        // Keep the ref up-to-date so toast handlers can resolve titles instantly
        allMoviesMapRef.current = movieMap;

        // Catalog data is ready — reveal UI immediately (0ms delay)
        setIsLoadingPage(false);

        // Background non-blocking pre-fetch for secondary platform catalogs & images
        void Promise.resolve().then(() => {
          prewarmPlatformCatalogs();
          const heroCandidateList = allMovieItems.slice(0, 10);
          heroCandidateList.forEach(async (m) => {
            if (!m.logoUrl && m.id) {
              try {
                const fetched = await fetchMovieById(m.id);
                if (fetched?.logoUrl) m.logoUrl = fetched.logoUrl;
              } catch (e) {}
            }
          });
        });

        // Fire-and-forget image preloader — don't block the UI thread
        const imageUrlsToPreload: string[] = [];
        if (feat?.backdropUrl) imageUrlsToPreload.push(feat.backdropUrl);
        if (feat?.posterUrl) imageUrlsToPreload.push(feat.posterUrl);
        top10.forEach((m) => {
          if (m.posterUrl) imageUrlsToPreload.push(m.posterUrl);
          if (m.backdropUrl) imageUrlsToPreload.push(m.backdropUrl);
        });
        cats.forEach((cat) => cat.movies.forEach((m) => {
          if (m.posterUrl) imageUrlsToPreload.push(m.posterUrl);
        }));
        const uniqueUrls = Array.from(new Set(imageUrlsToPreload)).slice(0, 20);
        // Non-blocking: preload in the background after paint
        void Promise.resolve().then(() => {
          uniqueUrls.forEach((url) => {
            const img = new Image();
            img.src = url;
          });
        });

        // Sync tab and title modal from URL parameters
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const tabParam = params.get('tab') as any;
          // Include 'anime' in the allow-list (was previously missing)
          if (tabParam && ['home', 'movies', 'series', 'anime', 'mylist'].includes(tabParam)) {
            setActiveTab(tabParam);
          }
          const titleParam = params.get('title');
          if (titleParam) {
            const found = movieMap.get(titleParam);
            if (found) {
              setActiveDetailMovie(found);
            } else {
              fetchMovieById(titleParam)
                .then((m) => { if (isMounted && m) setActiveDetailMovie(m); })
                .catch(() => showToast('Could not load the requested title'));
            }
          }
        }

        if (userData) {
          setUser(userData);
          setMyList(userData.myList || []);
          if (userData.profiles && userData.profiles.length > 0) {
            const active = userData.profiles.find((p) => p.id === userData.currentProfileId) || userData.profiles[0];
            setCurrentProfile(active);
            const profilePrefs = userData.preferencesByProfile?.[active.id];
            if (profilePrefs) {
              setPreferences(profilePrefs);
              const languages = Array.from(new Set([...profilePrefs.preferredAudioLanguages, ...profilePrefs.preferredSubtitleLanguages]));
              setSelectedLangFilter(languages.length ? languages : ['All']);
              setSelectedDubFilter(profilePrefs.dubOption);
            }
          }
        }
      } catch (error) {
        if (isMounted) setCatalogError(error instanceof Error ? error.message : 'The catalog could not be loaded.');
      } finally {
        if (isMounted) {
          setIsLoadingPage(false);
          setHasCompletedInitialLoad(true);
          // Dynamic loader duration between 3.0s and 5.0s for an authentic streaming platform launch experience
          const dynamicLoaderTime = Math.floor(Math.random() * 2000) + 3000;
          setTimeout(() => {
            if (isMounted) setIsSwitchingPlatform(false);
          }, dynamicLoaderTime);
        }
      }
    }

    // Safety fallback timer (max 5.5s) to guarantee loader unmasks under any condition
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoadingPage(false);
        setHasCompletedInitialLoad(true);
        setIsSwitchingPlatform(false);
      }
    }, 5500);

    loadData();
    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, [platform]);

  // Live Search Handling
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      if (searchQuery.trim() !== '') {
        setIsSearching(true);
        try {
          const response = await searchMovies(searchQuery.trim(), selectedGenreFilter);
          if (isMounted) {
            setSearchResults(response.movies);
            setSearchActor(response.actor);
            response.movies.forEach((m: Movie) => allMoviesMapRef.current.set(m.id, m));
          }
        } catch {
          if (isMounted) {
            setSearchResults([]);
            setSearchActor(undefined);
            showToast('Search is temporarily unavailable. Try again.');
          }
        } finally {
          if (isMounted) setIsSearching(false);
        }
      } else {
        if (isMounted) {
          setSearchResults([]);
          setSearchActor(undefined);
          setIsSearching(false);
        }
      }
    }, 450);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedGenreFilter]);

  // My List Toggle Handler — optimistic update with revert on API failure
  const handleToggleMyList = async (movieId: string) => {
    const prevList = [...myList];
    let updatedList = [...myList];
    if (updatedList.includes(movieId)) {
      updatedList = updatedList.filter((id) => id !== movieId);
    } else {
      updatedList.push(movieId);
    }
    setMyList(updatedList);
    try {
      await toggleMyListApi(movieId);
    } catch {
      setMyList(prevList); // revert on API failure
      showToast('Failed to update watchlist — please try again');
    }
  };

  const myListMovies = useMemo(() => {
    const map = new Map<string, Movie>();
    allMovies.forEach((m) => map.set(m.id, m));
    const resolved = myList.map((id) => map.get(id)).filter((m): m is Movie => m !== undefined);
    return filterMoviesByPreferences(resolved);
  }, [allMovies, myList, selectedGenreFilter, selectedDubFilter]);

  const languageFilteredSearchResults = useMemo(
    () => filterMoviesByPreferences(searchResults),
    [searchResults, selectedGenreFilter, selectedDubFilter]
  );
  const languageFilteredTop10 = useMemo(
    () => {
      const filtered = top10Movies.filter(matchesPreferredLanguages);
      return filtered.slice(0, 10);
    },
    [top10Movies]
  );
  const top10MoviesList = useMemo(() => {
    const movies = allMovies.filter(m => !m.isSeries && !m.isAnime && matchesPreferredLanguages(m));
    return movies.sort((a, b) => b.matchScore - a.matchScore || b.releaseYear - a.releaseYear).slice(0, 10);
  }, [allMovies]);
  const top10SeriesList = useMemo(() => {
    const series = allMovies.filter(m => m.isSeries && !m.isAnime && matchesPreferredLanguages(m));
    return series.sort((a, b) => b.matchScore - a.matchScore || b.releaseYear - a.releaseYear).slice(0, 10);
  }, [allMovies]);
  const top10AnimeList = useMemo(() => {
    const anime = allMovies.filter(m => m.isAnime && matchesPreferredLanguages(m));
    return anime.sort((a, b) => b.matchScore - a.matchScore || b.releaseYear - a.releaseYear).slice(0, 10);
  }, [allMovies]);
  const languageFilteredCategories = useMemo(
    () => categories.map((category) => ({ ...category, movies: category.movies.filter(matchesPreferredLanguages) })),
    [categories]
  );
  const discoveryKey = `${discoverySessionKey}:${discoveryRevision}:${activeTab}:${currentProfile?.id || 'guest'}:${selectedGenreFilter}:${selectedLangFilter.join(',')}`;
  const discoveryCategories = useMemo(
    () => languageFilteredCategories.map((category) => ({
      ...category,
      movies: shuffleForDiscovery(category.movies, `${discoveryKey}:${category.id}`),
    })),
    [languageFilteredCategories, discoveryKey]
  );
  // Streaming homepages expose a small, ranked set of rails rather than every
  // catalog source. Keep the full catalog for search/filtering, but surface at
  // four catalog rows. This leaves room for Top 10 and Continue Watching, so
  // every browse surface stays compact. When a regional language is selected,
  // its dedicated movie and series hubs lead the page.
  const languageRailPrefixes: Record<string, string> = {
    Hindi: 'hi', Tamil: 'ta', Telugu: 'te', Malayalam: 'ml', Kannada: 'kn',
    Marathi: 'mr', Bengali: 'bn',
  };
  const selectedBrowseLanguages = selectedLangFilter.includes('All') ? [] : selectedLangFilter;
  const curatedCategories = useMemo(() => {
    const nonEmpty = discoveryCategories.filter((category) => category.movies.length > 0);
    const languageHubIds = selectedBrowseLanguages.flatMap((language) => {
      const prefix = languageRailPrefixes[language];
      if (!prefix) return [];
      if (activeTab === 'movies') return [`${prefix}-movies`];
      if (activeTab === 'series') return [`${prefix}-series`];
      return [`${prefix}-movies`, `${prefix}-series`];
    });
    const baseIds = activeTab === 'movies'
      ? ['trending-movies', 'recently-added-movies', 'popular-movies', 'top-rated-movies', 'upcoming-movies', 'leaving-soon-movies']
      : activeTab === 'series'
        ? ['trending-series', 'recently-added-series', 'popular-series', 'top-rated-series', 'upcoming-series']
        : activeTab === 'anime'
          ? ['trending-anime', 'recently-added-anime', 'popular-anime', 'top-rated-anime', 'upcoming-anime', 'anime-action', 'anime-fantasy', 'anime-comedy']
          : ['trending-movies', 'recently-added-movies', 'popular-movies', 'top-rated-movies', 'upcoming-movies', 'leaving-soon-movies', 'trending-series', 'recently-added-series', 'popular-series', 'top-rated-series', 'upcoming-series', 'trending-anime', 'popular-anime', 'upcoming-anime'];
    const samePageRegional = nonEmpty
      .filter((category) => activeTab === 'movies' ? category.id.endsWith('-movies') : activeTab === 'series' ? category.id.endsWith('-series') : activeTab === 'home')
      .map((category) => category.id);
    const orderedIds = Array.from(new Set([...languageHubIds, ...baseIds, ...samePageRegional, ...nonEmpty.map((category) => category.id)]));
    const usedGenreTitles = new Set<string>();
    return orderedIds
      .map((id) => nonEmpty.find((category) => category.id === id))
      .filter((category): category is Category => Boolean(category))
      .map((category) => ({
        ...category,
        movies: category.movies.filter((movie) => {
          if (!hasGenre(movie, selectedGenreFilter)) return false;
          return true;
        }),
      }))
      .filter((category) => category.movies.length > 0)
      // Keep every matching rail when a genre is selected; the compact ten-rail
      // cap is only for the unfiltered homepage.
      .slice(0, selectedGenreFilter === 'All' ? 20 : 100);
  }, [discoveryCategories, selectedBrowseLanguages, activeTab, selectedGenreFilter]);
  const heroCandidates = useMemo(() => {
    const matchesTab = (movie: Movie) => {
      if (movie.isUpcoming) return false;
      // Strictly require a valid backdropUrl or posterUrl image
      if (!movie.backdropUrl && !movie.posterUrl) return false;
      if (activeTab === 'home') return true;
      if (activeTab === 'movies') return !movie.isSeries && !movie.isAnime;
      if (activeTab === 'series') return movie.isSeries && !movie.isAnime;
      if (activeTab === 'anime') return Boolean(movie.isAnime);
      return false;
    };
    const candidates = allMovies.filter(matchesTab);
    if (activeTab === 'home' && featuredMovie && (featuredMovie.backdropUrl || featuredMovie.posterUrl) && !candidates.some((movie) => movie.id === featuredMovie.id)) {
      candidates.unshift(featuredMovie);
    }
    return shuffleForDiscovery(candidates, `hero:${discoveryKey}`);
  }, [activeTab, allMovies, featuredMovie, discoveryKey]);
  const heroCandidateIds = heroCandidates.map((movie) => movie.id).join(',');
  useEffect(() => {
    setHeroIndex(0);
    setIsHeroReady(false);
  }, [heroCandidateIds]);

  useEffect(() => {
    if (heroCandidates.length < 2) return;
    if (!isHeroReady) return;

    const timer = window.setTimeout(() => {
      setIsHeroReady(false); // Pause rotation until the next movie is fully loaded
      setHeroIndex((index) => (index + 1) % heroCandidates.length);
    }, HERO_ROTATION_MS);

    return () => window.clearTimeout(timer);
  }, [heroCandidateIds, heroIndex, isHeroReady, heroCandidates.length]);
  const heroMovie = heroCandidates.length
    ? heroCandidates[heroIndex % heroCandidates.length]
    : featuredMovie;
  const languageAwareCategoryTitle = (title: string) =>
    selectedBrowseLanguages.length === 1 ? `Best in ${selectedBrowseLanguages[0]} · ${title}` : title;
  const languageLabel = selectedBrowseLanguages.length ? selectedBrowseLanguages.join(' & ') : 'All Languages';
  const availableGenres = useMemo(() => {
    const labels = new Map<string, string>();
    allMovies.flatMap((movie) => movie.genres || []).forEach((genre) => {
      const label = genre.trim();
      if (label) labels.set(normalizeGenre(label), label);
    });
    return Array.from(labels.values()).sort((a, b) => a.localeCompare(b));
  }, [allMovies]);
  const relatedMovies = useMemo(() => {
    if (!activeDetailMovie) return [];
    const genreSet = new Set(activeDetailMovie.genres.map((genre) => genre.toLowerCase()));
    const languageSet = new Set([...(activeDetailMovie.audioLanguages || []), ...(activeDetailMovie.subtitleLanguages || [])].map((language) => language.toLowerCase()));
    const tagSet = new Set((activeDetailMovie.tags || []).map((tag) => tag.toLowerCase()));
    return allMovies
      .filter((candidate) => candidate.id !== activeDetailMovie.id)
      .map((candidate) => {
        const sharedGenres = candidate.genres.filter((genre) => genreSet.has(genre.toLowerCase())).length;
        const sharedLanguages = [...(candidate.audioLanguages || []), ...(candidate.subtitleLanguages || [])]
          .filter((language) => languageSet.has(language.toLowerCase())).length;
        const sharedTags = (candidate.tags || []).filter((tag) => tagSet.has(tag.toLowerCase())).length;
        const sameType = candidate.isAnime === activeDetailMovie.isAnime && candidate.isSeries === activeDetailMovie.isSeries;
        const score = sharedGenres * 30 + sharedLanguages * 12 + sharedTags * 8 + (sameType ? 18 : 0) + (candidate.isUpcoming ? -20 : 0);
        return { candidate, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || b.candidate.matchScore - a.candidate.matchScore)
      .slice(0, 6)
      .map(({ candidate }) => candidate);
  }, [activeDetailMovie, allMovies]);

  return (
    <main className={platform === 'hotstar' ? 'hotstar-main-content' : ''} style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: '#FFF', width: '100%', position: 'relative' }}>
      {/* Top Navigation Bar with Status Bar Genre & Language Dropdowns */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGenreFilter={selectedGenreFilter}
        onGenreFilterChange={setSelectedGenreFilter}
        availableGenres={availableGenres}
        selectedLangFilter={languageLabel}
        selectedDubFilter={selectedDubFilter}
        uiLanguage={preferences.uiLanguage}
        onDubFilterChange={setSelectedDubFilter}
        currentProfile={currentProfile}
        onOpenProfileModal={() => setShowProfileModal(true)}
        onOpenOnboardingModal={() => setShowOnboardingModal(true)}
      />

      {/* Platform-Authentic Full-Page Initial & Switching Loader */}
      {(!hasCompletedInitialLoad || isSwitchingPlatform) && <PlatformInitialLoader />}

      {/* Main Page Content Router */}
      <div style={{ opacity: hasCompletedInitialLoad ? 1 : 0, transition: 'opacity 0.3s' }}>
      {searchQuery.trim() !== '' ? (
        /* Search View */
        <div style={{ paddingTop: '110px', width: '100%', minHeight: '80vh', paddingBottom: '60px' }}>
          <div style={{ padding: '0 4%', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#FFF', marginBottom: '6px' }}>
                {`Results for "${searchQuery}"`}
              </h2>
              <p style={{ color: '#AAA', fontSize: '0.9rem' }}>
                {isSearching ? 'Searching catalog…' : `Found ${languageFilteredSearchResults.length} matching title${languageFilteredSearchResults.length === 1 ? '' : 's'}`}
              </p>
            </div>

            <button
              onClick={() => setSearchQuery('')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Clear Search
            </button>
          </div>

          {/* Search Genre Suggestion Chips */}
          <div style={{ padding: '0 4%', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: '#777', fontWeight: 600 }}>Quick Genres:</span>
            {availableGenres.slice(0, 12).map((g) => (
              <button
                key={g}
                onClick={() => setSearchQuery(g)}
                style={{
                  background: searchQuery.toLowerCase() === g.toLowerCase() ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.08)',
                  color: '#FFF',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {g}
              </button>
            ))}
          </div>

          {isSearching && languageFilteredSearchResults.length === 0 && !searchActor ? (
            <div className="classic-grid">
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{ aspectRatio: '2/3', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
              ))}
            </div>
          ) : languageFilteredSearchResults.length || searchActor || isSearching ? (
            <>
              {searchActor && (
                <div style={{ margin: '0 4% 32px 4%', padding: '24px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <img src={searchActor.profileUrl} alt={searchActor.name} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-color)' }} />
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>{searchActor.name}</h2>
                    <p style={{ color: '#AAA', fontSize: '0.9rem', lineHeight: '1.4' }}>{searchActor.knownFor}</p>
                  </div>
                </div>
              )}
              <div className="classic-grid">
                {languageFilteredSearchResults.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onPlay={(m) => setActiveVideoMovie(m)}
                onOpenDetails={handleOpenDetails}
                onToggleMyList={handleToggleMyList}
                isMyList={myList.includes(movie.id)}
              />
            ))}</div>
            </>
          ) : (
            <div style={{ padding: '40px 4%', textAlign: 'center', color: '#AAA' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '12px' }}>{`No titles found for "${searchQuery}".`}</p>
              <p style={{ fontSize: '0.9rem', color: '#777' }}>Try searching by title, cast member, or click one of the quick genre chips above.</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {catalogError && (
            <div role="status" style={{ padding: '96px 4% 24px', color: '#FDE68A', background: '#2A2110', borderBottom: '1px solid rgba(245,158,11,.25)' }}>
              {catalogError} You can refresh to retry unavailable rails.
            </div>
          )}
          {/* Dynamic Hero Banner (Hidden on My List Tab) */}
          {activeTab !== 'mylist' && (
          <HeroBanner 
          movie={heroMovie} 
          carouselMovies={heroCandidates.slice(0, 8)}
          activeCarouselIndex={heroIndex % (heroCandidates.slice(0, 8).length || 1)}
          onSelectCarouselIndex={(idx) => { setHeroIndex(idx); setIsHeroReady(true); }}
          onPlay={handlePlayMovie} 
          onOpenDetails={handleOpenDetails} 
          onToggleMyList={handleToggleMyListWithToast}
          isMyList={heroMovie ? myList.includes(heroMovie.id) : false}
          onHeroReady={handleHeroReady}
        />

          )}

          {/* Page-Specific Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ marginTop: activeTab === 'mylist' ? '110px' : '-40px', position: 'relative', zIndex: 20, width: '100%', minHeight: '50vh' }}
            >
              {isTabTransitioning ? (
                <div style={{ paddingTop: activeTab === 'mylist' ? '20px' : '40px' }}>
                  <MovieRowSkeleton />
                  <MovieRowSkeleton />
                  <MovieRowSkeleton />
                </div>
              ) : (
              <>

                {activeTab === 'home' && (
                  /* Home Tab: Continue Watching + Top 10 Row + Dynamic Categories */
                  <>
                    {platform === 'hotstar' && (
                      <div className="hotstar-category-pills" style={{ display: 'flex', gap: '10px', padding: '0 4% 16px 4%', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {['All', 'Popular', 'Hotstar Specials', 'Star Plus', 'Action', 'Comedies', 'Drama', 'Hindi', 'English', 'Tamil', 'Telugu'].map((pill) => {
                          const isActive = selectedGenreFilter === pill;
                          return (
                            <button
                              key={pill}
                              onClick={() => setSelectedGenreFilter(pill)}
                              style={{
                                background: isActive ? '#1F80E0' : 'rgba(255, 255, 255, 0.08)',
                                color: '#FFF',
                                border: 'none',
                                padding: '8px 18px',
                                borderRadius: '20px',
                                fontSize: '0.88rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                boxShadow: isActive ? '0 4px 14px rgba(31, 128, 224, 0.4)' : 'none'
                              }}
                            >
                              {pill}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {continueWatching.length > 0 && (
                      <MovieRow
                        title={`Continue Watching for ${currentProfile?.name || 'You'}`}
                        movies={continueWatching.filter(matchesPreferredLanguages)}
                        onPlay={(m) => handlePlayMovie(m)}
                        onOpenDetails={handleOpenDetails}
                        onToggleMyList={handleToggleMyListWithToast}
                        myList={myList}
                      />
                    )}
                    {languageFilteredTop10.length > 0 && (
                      <MovieRow title="Top 10 Titles Today" movies={languageFilteredTop10} isTop10={true} onPlay={(m) => handlePlayMovie(m)} onOpenDetails={handleOpenDetails} onToggleMyList={handleToggleMyListWithToast} myList={myList} />
                    )}
                    {selectedGenreFilter !== 'All' ? (
                      /* Filtered Category Grid View for Hotstar & Pill Selections */
                      <div style={{ padding: '20px 4%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF' }}>
                            {selectedGenreFilter} Catalog
                          </h3>
                          <button
                            onClick={() => setSelectedGenreFilter('All')}
                            style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '16px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Clear Filter ✕
                          </button>
                        </div>
                        {allMovies.filter((m) => hasGenre(m, selectedGenreFilter)).length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                            {allMovies
                              .filter((m) => hasGenre(m, selectedGenreFilter))
                              .map((movie) => (
                                <MovieCard
                                  key={movie.id}
                                  movie={movie}
                                  onPlay={(m) => handlePlayMovie(m)}
                                  onOpenDetails={handleOpenDetails}
                                  onToggleMyList={handleToggleMyListWithToast}
                                  isMyList={myList.includes(movie.id)}
                                />
                              ))}
                          </div>
                        ) : (
                          <div style={{ padding: '60px 0', textAlign: 'center', color: '#808080' }}>
                            <p style={{ fontSize: '1.1rem' }}>No titles available in {selectedGenreFilter} right now.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      curatedCategories.map((category) => (
                        <MovieRow
                          key={category.id}
                          title={languageAwareCategoryTitle(category.name)}
                          movies={category.movies}
                          onPlay={(m) => handlePlayMovie(m)}
                          onOpenDetails={handleOpenDetails}
                          onToggleMyList={handleToggleMyListWithToast}
                          myList={myList}
                          onExploreAll={(catTitle) => {
                            const cleanName = catTitle.replace(/❯/g, '').trim();
                            setSelectedGenreFilter(cleanName);
                          }}
                        />
                      ))
                    )}
                  </>
                )}

                {activeTab === 'movies' && (
                  /* Movies Tab: Top 10 Movies + Dynamic Movie Rows with Genre Filter + Upcoming */
                  <div style={{ paddingTop: '10px' }}>
                    {selectedGenreFilter === 'All' && top10MoviesList.length > 0 && (
                      <MovieRow title="Top 10 Movies Today" movies={top10MoviesList} isTop10={true} onPlay={(m) => handlePlayMovie(m)} onOpenDetails={handleOpenDetails} onToggleMyList={handleToggleMyListWithToast} myList={myList} />
                    )}
                    {curatedCategories
                      .map((cat) => ({
                        ...cat,
                        movies: cat.movies.filter((m) => {
                          if (m.isUpcoming) return false; // upcoming shown separately below
                          if (m.isSeries || m.isAnime) return false;
                          return hasGenre(m, selectedGenreFilter);
                        }),
                      }))
                      .filter((cat) => cat.movies.length > 0)
                      .map((cat) => (
                        <MovieRow
                          key={`movies-${cat.id}`}
                          title={languageAwareCategoryTitle(cat.name)}
                          movies={cat.movies}
                          onPlay={(m) => handlePlayMovie(m)}
                          onOpenDetails={handleOpenDetails}
                          onToggleMyList={handleToggleMyListWithToast}
                          myList={myList}
                        />
                      ))}

                    {/* Upcoming Movies — pinned section, bypasses curatedCategories slice */}
                    {(() => {
                      const upcomingCat = discoveryCategories.find((c) => c.id === 'upcoming-movies');
                      const upcomingMovies = (upcomingCat?.movies || []).filter(
                        (m) => m.isUpcoming && !m.isSeries && !m.isAnime &&
                          hasGenre(m, selectedGenreFilter)
                      );
                      return upcomingMovies.length >= 2 ? (
                        <MovieRow
                          title="🔔 New & Upcoming Movies"
                          movies={upcomingMovies}
                          onPlay={(m) => handlePlayMovie(m)}
                          onOpenDetails={handleOpenDetails}
                          onToggleMyList={handleToggleMyListWithToast}
                          myList={myList}
                        />
                      ) : null;
                    })()}
                  </div>
                )}

                {activeTab === 'series' && (
                  /* Series Tab: Top 10 TV Series + Dynamic TV Series Rows with Genre Filter + Upcoming */
                  <div style={{ paddingTop: '10px' }}>
                    {selectedGenreFilter === 'All' && top10SeriesList.length > 0 && (
                      <MovieRow title="Top 10 TV Series Today" movies={top10SeriesList} isTop10={true} onPlay={(m) => handlePlayMovie(m)} onOpenDetails={handleOpenDetails} onToggleMyList={handleToggleMyListWithToast} myList={myList} />
                    )}
                    {curatedCategories
                      .map((cat) => ({
                        ...cat,
                        movies: cat.movies.filter((m) => {
                          if (m.isUpcoming) return false;
                          if (!m.isSeries || m.isAnime) return false;
                          return hasGenre(m, selectedGenreFilter);
                        }),
                      }))
                      .filter((cat) => cat.movies.length > 0)
                      .map((cat) => (
                        <MovieRow
                          key={`series-${cat.id}`}
                          title={languageAwareCategoryTitle(cat.name)}
                          movies={cat.movies}
                          onPlay={(m) => handlePlayMovie(m)}
                          onOpenDetails={handleOpenDetails}
                          onToggleMyList={handleToggleMyListWithToast}
                          myList={myList}
                        />
                      ))}

                    {/* Upcoming Series — pinned */}
                    {(() => {
                      const upcomingCat = discoveryCategories.find((c) => c.id === 'upcoming-series');
                      const upcomingMovies = (upcomingCat?.movies || []).filter(
                        (m) => m.isUpcoming && m.isSeries && !m.isAnime &&
                          hasGenre(m, selectedGenreFilter)
                      );
                      return upcomingMovies.length >= 2 ? (
                        <MovieRow
                          title="🔔 New & Upcoming Series"
                          movies={upcomingMovies}
                          onPlay={(m) => handlePlayMovie(m)}
                          onOpenDetails={handleOpenDetails}
                          onToggleMyList={handleToggleMyListWithToast}
                          myList={myList}
                        />
                      ) : null;
                    })()}
                  </div>
                )}

                {activeTab === 'anime' && (
                  /* Anime Tab: Top 10 Anime + Dynamic Anime Rows with Genre Filter + Upcoming */
                  <div style={{ paddingTop: '10px' }}>
                    {selectedGenreFilter === 'All' && top10AnimeList.length > 0 && (
                      <MovieRow title="Top 10 Anime Today" movies={top10AnimeList} isTop10={true} onPlay={(m) => handlePlayMovie(m)} onOpenDetails={handleOpenDetails} onToggleMyList={handleToggleMyListWithToast} myList={myList} />
                    )}
                    {curatedCategories
                      .map((cat) => ({
                        ...cat,
                        movies: cat.movies.filter((m) => {
                          if (m.isUpcoming) return false;
                          if (!m.isAnime) return false;
                          return hasGenre(m, selectedGenreFilter);
                        }),
                      }))
                      .filter((cat) => cat.movies.length > 0)
                      .map((cat) => (
                        <MovieRow
                          key={`anime-${cat.id}`}
                          title={languageAwareCategoryTitle(cat.name)}
                          movies={cat.movies}
                          onPlay={(m) => handlePlayMovie(m)}
                          onOpenDetails={handleOpenDetails}
                          onToggleMyList={handleToggleMyListWithToast}
                          myList={myList}
                        />
                      ))}

                    {/* Upcoming Anime — pinned */}
                    {(() => {
                      const upcomingCat = discoveryCategories.find((c) => c.id === 'upcoming-anime');
                      const upcomingMovies = (upcomingCat?.movies || []).filter(
                        (m) => m.isUpcoming && m.isAnime &&
                          hasGenre(m, selectedGenreFilter)
                      );
                      return upcomingMovies.length >= 2 ? (
                        <MovieRow
                          title="🔔 New & Upcoming Anime"
                          movies={upcomingMovies}
                          onPlay={(m) => handlePlayMovie(m)}
                          onOpenDetails={handleOpenDetails}
                          onToggleMyList={handleToggleMyListWithToast}
                          myList={myList}
                        />
                      ) : null;
                    })()}
                  </div>
                )}

                {activeTab === 'mylist' && (
                  /* My Watchlist Tab */
                  <div>
                    {/* Header row with count + genre filter chips */}
                    <div style={{ paddingLeft: '4%', paddingRight: '4%', marginBottom: '24px' }}>
                      <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#FFF', marginBottom: '16px' }}>
                        My Watchlist ({myListMovies.length})
                      </h2>
                      {/* Genre filter chips for watchlist */}
                      {myListMovies.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.82rem', color: '#777', fontWeight: 600, flexShrink: 0 }}>Filter:</span>
                          {['All', ...availableGenres].map((g) => (
                            <button
                              key={g}
                              onClick={() => setSelectedGenreFilter(g)}
                              style={{
                                background: selectedGenreFilter === g ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)',
                                color: '#FFF',
                                border: selectedGenreFilter === g ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.15)',
                                padding: '5px 14px',
                                borderRadius: '20px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {myListMovies.length > 0 ? (
                      <div className="classic-grid">
                        {myListMovies.map((movie) => (
                          <MovieCard
                            key={movie.id}
                            movie={movie}
                            onPlay={(m) => handlePlayMovie(m)}
                            onOpenDetails={handleOpenDetails}
                            onToggleMyList={handleToggleMyListWithToast}
                            isMyList={true}
                          />
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '70px 20px', backgroundColor: 'var(--bg-elevated)', borderRadius: '12px', margin: '0 4%', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Film size={48} color="var(--primary-color)" style={{ marginBottom: '16px' }} />
                        {selectedGenreFilter !== 'All' ? (
                          <>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px', color: '#FFF' }}>No {selectedGenreFilter} titles in your Watchlist</h3>
                            <p style={{ color: '#AAA', maxWidth: '460px', margin: '0 auto 24px', fontSize: '0.95rem', lineHeight: 1.5 }}>
                              You don't have any {selectedGenreFilter} titles saved yet. Clear the filter to see all your watchlisted titles.
                            </p>
                            <button
                              onClick={() => setSelectedGenreFilter('All')}
                              style={{ backgroundColor: 'var(--primary-color)', color: '#FFF', border: 'none', padding: '12px 28px', borderRadius: '4px', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px var(--primary-glow)' }}
                            >
                              Clear Filter
                            </button>
                          </>
                        ) : (
                          <>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px', color: '#FFF' }}>Your Watchlist is Empty</h3>
                            <p style={{ color: '#AAA', maxWidth: '460px', margin: '0 auto 24px', fontSize: '0.95rem', lineHeight: 1.5 }}>
                              Add movies and TV series to your watchlist by clicking the plus (+) icon on any title so you can easily find and watch them anytime.
                            </p>
                            <button
                              onClick={() => handleTabChange('home')}
                              style={{ backgroundColor: 'var(--primary-color)', color: '#FFF', border: 'none', padding: '12px 28px', borderRadius: '4px', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px var(--primary-glow)' }}
                            >
                              Explore Trending Titles
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
        </>
      )}

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-color)',
            color: '#FFF',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 6px 18px var(--primary-glow-strong)',
            transition: 'transform 0.2s',
          }}
          title="Scroll to Top"
        >
          <ArrowUp size={22} />
        </button>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #333', marginTop: '80px', padding: '40px 4%', color: '#757575', fontSize: '0.85rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div>High-Speed Servers</div>
          <div>4K Ultra Resolution</div>
          <div>Audio & Subtitles</div>
          <div>Help Center</div>
          <div>Terms of Use</div>
          <div>Privacy Policy</div>
        </div>
        <p>Catalog metadata provided by TMDB.</p>
      </footer>

      {/* Detail Modal */}
      {activeDetailMovie && (
        <MovieDetailModal
          movie={activeDetailMovie}
          onClose={handleCloseDetails}
          onPlay={handleStreamNow}
          onOpenDetails={handleOpenDetails}
          onToggleMyList={handleToggleMyListWithToast}
          isMyList={myList.includes(activeDetailMovie.id)}
          similarMovies={relatedMovies}
        />
      )}

      </div>

      {/* Video Player Modal */}
      {activeVideoMovie && (
        <VideoPlayerModal
          movie={activeVideoMovie}
          onClose={() => setActiveVideoMovie(null)}
        />
      )}


      {/* Profile Modal */}
      {showProfileModal && (user || currentProfile) && (
        <ProfileModal
          profiles={user?.profiles || [currentProfile!]}
          currentProfile={currentProfile}
          onSelectProfile={(prof) => {
            switchProfileApi(prof.id).catch(() => {});
            setCurrentProfile(prof);
            setDiscoveryRevision((revision) => revision + 1);
            const profilePrefs = user?.preferencesByProfile?.[prof.id] || { uiLanguage: 'English', preferredAudioLanguages: [], preferredSubtitleLanguages: [], dubOption: 'all' as const };
            setPreferences(profilePrefs);
            setSelectedDubFilter(profilePrefs.dubOption);
            const languages = Array.from(new Set([...profilePrefs.preferredAudioLanguages, ...profilePrefs.preferredSubtitleLanguages]));
            setSelectedLangFilter(languages.length ? languages : ['All']);
            setShowProfileModal(false);
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Onboarding Language & Dub Preference Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onSave={handleSavePreferences}
        currentPreferences={{
          ...preferences,
          dubOption: selectedDubFilter,
        }}
      />
      {/* Dynamic Glassmorphic Toast Notification */}
      {toastMessage && (
        <div
          className="toast-animate"
          style={{
            position: 'fixed',
            bottom: '30px',
            left: '30px',
            backgroundColor: 'rgba(20, 20, 20, 0.94)',
            color: '#FFF',
            border: '1px solid var(--primary-glow-strong)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.85), 0 0 16px var(--primary-glow)',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 800,
            zIndex: 2000,
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', display: 'inline-block', boxShadow: '0 0 8px var(--primary-color)' }} />
          {toastMessage}
        </div>
      )}
    </main>
  );
}
