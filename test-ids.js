const http = require('http');
http.get('http://localhost:4000/api/movies/categories', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const cats = JSON.parse(data);
    const m = [];
    cats.forEach(c => {
      c.movies.forEach(movie => {
        if (movie.title.toLowerCase().includes('teach you a lesson')) {
          m.push({ id: movie.id, title: movie.title, rail: c.name });
        }
      });
    });
    console.log(m);
  });
});
