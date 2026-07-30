const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#141414"/>
  <path d="M18 12h9l10 23V12h9v40h-9L27 29v23h-9z" fill="#e50914"/>
</svg>`;

export function GET() {
  return new Response(favicon, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
