import { DunetaHome } from '@duneta/client/starter/layouts';

export function meta() {
  return [
    { title: 'Duneta — Full-stack React & Hono on Cloudflare Workers' },
    {
      name: 'description',
      content:
        'Full-stack React with Hono API, deployed on Cloudflare Workers. Server-rendered UI and /api on one edge runtime.',
    },
  ];
}

export default function HomePage() {
  return <DunetaHome />;
}
