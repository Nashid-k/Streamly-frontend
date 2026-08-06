import { useState, useRef, useEffect, MutableRefObject } from 'react';
import { searchMovies } from '../lib/api';
import { Movie, Actor } from '../types';

export function useSearch(
  searchQuery: string,
  selectedGenreFilter: string,
  allMoviesMapRef: MutableRefObject<Map<string, Movie>>,
  showToast: (msg: string) => void
) {
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchActor, setSearchActor] = useState<Actor | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);
  const currentSearchNonce = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      if (searchQuery.trim() !== '') {
        setIsSearching(true);
        const nonce = ++currentSearchNonce.current;
        try {
          const response = await searchMovies(searchQuery.trim(), selectedGenreFilter);
          if (isMounted && nonce === currentSearchNonce.current) {
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
  }, [searchQuery, selectedGenreFilter, allMoviesMapRef, showToast]);

  return { searchResults, searchActor, isSearching };
}
