const http = require('http');
http.get('http://localhost:4000/api/movies/top10?platform=nprime', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const movies = JSON.parse(data);
    const titles = movies.map(m => m.title);
    console.log("nprime Titles:", titles);
  });
});
