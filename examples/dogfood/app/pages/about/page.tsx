import { Suspense } from 'react';
import { DunetaLink as Link } from 'duneta/views/component';
import { DunetaAsyncBoundary } from 'duneta/views/feedback';
import { useHttpQuery } from 'duneta/query';

type HealthResponse = {
  ok: boolean;
  message: string;
};

export function meta() {
  return [{ title: 'About — Duneta' }];
}

function AboutHealth() {
  const { data } = useHttpQuery<HealthResponse>('/health', { ssr: true });

  return (
    <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700">
      API health: {data.message}
    </p>
  );
}

export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-medium text-cyan-700">App page</p>
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">About Duneta</h1>
      <p className="text-lg leading-8 text-slate-600">
        Trang này nằm trong <code className="rounded bg-slate-100 px-1.5 py-0.5 text-cyan-800">app/pages/about/page.tsx</code>{' '}
        và override route mặc định từ package.
      </p>
      <DunetaAsyncBoundary>
        <Suspense
          fallback={
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700">
              API health: Checking…
            </p>
          }
        >
          <AboutHealth />
        </Suspense>
      </DunetaAsyncBoundary>
      <Link href="/datatable" className="text-cyan-700 hover:text-cyan-900">
        DataTable demo →
      </Link>
      <Link href="/" className="text-cyan-700 hover:text-cyan-900">
        ← Về trang chủ
      </Link>
    </main>
  );
}
