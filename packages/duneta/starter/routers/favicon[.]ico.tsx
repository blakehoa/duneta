const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Duneta">
  <rect width="32" height="32" rx="8" fill="#0891b2"/>
  <path fill="#fff" d="M8 10h16v3H13v9h-3v-9H8v-3z"/>
</svg>`;

export function loader() {
  return new Response(FAVICON_SVG, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
