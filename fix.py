import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Remove auto-open ProfileModal
content = re.sub(
    r"if \(!localStorage\.getItem\('profileSelected'\)\) \{\s*setShowProfileModal\(true\);\s*\}",
    "",
    content
)

# 2. Add renderFilteredGrid above `return (`
grid_helper = """
  const renderFilteredGrid = (title: string, filterFn: (m: Movie) => boolean) => {
    const matchingMovies = allMovies.filter((m) => filterFn(m) && hasGenre(m, selectedGenreFilter));
    return (
      <div style={{ padding: '20px 4%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF' }}>
            {title}
          </h3>
          <button
            onClick={() => setSelectedGenreFilter('All')}
            style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '16px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}
          >
            Clear Filter ✕
          </button>
        </div>
        {matchingMovies.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
            {matchingMovies.map((movie) => (
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
    );
  };
"""

content = content.replace("  return (\n    <main className={platform === 'hotstar'", grid_helper + "\n  return (\n    <main className={platform === 'hotstar'")

# 3. Replace the home tab grid view with the helper
home_grid_search = """                    {selectedGenreFilter !== 'All' ? (
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
                    ) : ("""

content = content.replace(home_grid_search, """                    {selectedGenreFilter !== 'All' ? (
                      renderFilteredGrid(`${selectedGenreFilter} Catalog`, () => true)
                    ) : (""")

# 4. Modify movies tab
movies_tab_search = """                {activeTab === 'movies' && (
                  /* Movies Tab: Top 10 Movies + Dynamic Movie Rows with Genre Filter + Upcoming */
                  <div style={{ paddingTop: '10px' }}>
                    {selectedGenreFilter === 'All' && top10MoviesList.length > 0 && ("""

movies_tab_replace = """                {activeTab === 'movies' && (
                  /* Movies Tab: Top 10 Movies + Dynamic Movie Rows with Genre Filter + Upcoming */
                  <div style={{ paddingTop: '10px' }}>
                    {selectedGenreFilter !== 'All' ? (
                      renderFilteredGrid(`${selectedGenreFilter} Movies`, (m) => !m.isSeries && !m.isAnime)
                    ) : (
                      <>
                        {selectedGenreFilter === 'All' && top10MoviesList.length > 0 && ("""
content = content.replace(movies_tab_search, movies_tab_replace)
# Close movies tab fragment
content = content.replace("""                      ) : null;
                    })()}
                  </div>
                )}

                {activeTab === 'series'""", """                      ) : null;
                    })()}
                  </>
                  )}
                  </div>
                )}

                {activeTab === 'series'""")


# 5. Modify series tab
series_tab_search = """                {activeTab === 'series' && (
                  /* Series Tab: Top 10 TV Series + Dynamic TV Series Rows with Genre Filter + Upcoming */
                  <div style={{ paddingTop: '10px' }}>
                    {selectedGenreFilter === 'All' && top10SeriesList.length > 0 && ("""

series_tab_replace = """                {activeTab === 'series' && (
                  /* Series Tab: Top 10 TV Series + Dynamic TV Series Rows with Genre Filter + Upcoming */
                  <div style={{ paddingTop: '10px' }}>
                    {selectedGenreFilter !== 'All' ? (
                      renderFilteredGrid(`${selectedGenreFilter} Series`, (m) => !!m.isSeries && !m.isAnime)
                    ) : (
                      <>
                        {selectedGenreFilter === 'All' && top10SeriesList.length > 0 && ("""
content = content.replace(series_tab_search, series_tab_replace)
# Close series tab fragment
content = content.replace("""                      ) : null;
                    })()}
                  </div>
                )}

                {activeTab === 'anime'""", """                      ) : null;
                    })()}
                  </>
                  )}
                  </div>
                )}

                {activeTab === 'anime'""")


# 6. Modify anime tab
anime_tab_search = """                {activeTab === 'anime' && (
                  /* Anime Tab: Top 10 Anime + Dynamic Anime Rows with Genre Filter + Upcoming */
                  <div style={{ paddingTop: '10px' }}>
                    {selectedGenreFilter === 'All' && top10AnimeList.length > 0 && ("""

anime_tab_replace = """                {activeTab === 'anime' && (
                  /* Anime Tab: Top 10 Anime + Dynamic Anime Rows with Genre Filter + Upcoming */
                  <div style={{ paddingTop: '10px' }}>
                    {selectedGenreFilter !== 'All' ? (
                      renderFilteredGrid(`${selectedGenreFilter} Anime`, (m) => !!m.isAnime)
                    ) : (
                      <>
                        {selectedGenreFilter === 'All' && top10AnimeList.length > 0 && ("""
content = content.replace(anime_tab_search, anime_tab_replace)
# Close anime tab fragment
content = content.replace("""                      ) : null;
                    })()}
                  </div>
                )}

                {activeTab === 'mylist'""", """                      ) : null;
                    })()}
                  </>
                  )}
                  </div>
                )}

                {activeTab === 'mylist'""")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("Done")
