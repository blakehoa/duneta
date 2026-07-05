export type DunetaMetaDescriptor =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }
  | { rel: string; href: string; as?: string; type?: string; crossOrigin?: string };

export type DunetaPageMeta = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
  robots?: string;
  canonical?: string;
};

export function defineMeta(meta: readonly DunetaMetaDescriptor[]) {
  return () => [...meta];
}

export function createPageMeta({
  canonical,
  description,
  image,
  robots,
  siteName,
  title,
  url,
}: DunetaPageMeta): DunetaMetaDescriptor[] {
  const meta: DunetaMetaDescriptor[] = [];

  if (title) {
    meta.push({ title }, { property: 'og:title', content: title });
  }
  if (description) {
    meta.push(
      { name: 'description', content: description },
      { property: 'og:description', content: description },
    );
  }
  if (image) meta.push({ property: 'og:image', content: image });
  if (url) meta.push({ property: 'og:url', content: url });
  if (siteName) meta.push({ property: 'og:site_name', content: siteName });
  if (robots) meta.push({ name: 'robots', content: robots });
  if (canonical) meta.push({ rel: 'canonical', href: canonical });

  return meta;
}

export function preloadImage(src: string, options: { type?: string } = {}) {
  return { rel: 'preload', as: 'image', href: src, type: options.type };
}

export function preconnect(href: string, crossOrigin = '') {
  return { rel: 'preconnect', href, crossOrigin };
}

