import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { DunetaAppProviders } from 'duneta/client/providers';
import 'duneta/client/themes/globals.css';

/** Document shell — HTML, meta, scripts. No route providers here. */
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-foreground">
        <DunetaAppProviders theme="light">{children}</DunetaAppProviders>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
