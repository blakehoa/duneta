import type { CSSProperties, ImgHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { IMAGE_OPTIMIZATION_PATH } from '../../core/image-path.js';
import { getConfig } from '../../config/client/registry.js';
import type { ImageConfig } from '../../config/client/types.js';

export type DunetaImageLoaderParams = {
  src: string;
  width?: number;
  quality?: number;
};

export type DunetaImageLoader = (params: DunetaImageLoaderParams) => string;

export type DunetaImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'height' | 'loading' | 'src' | 'srcSet' | 'width'
> & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  loader?: DunetaImageLoader;
  widths?: readonly number[];
  objectFit?: CSSProperties['objectFit'];
  objectPosition?: CSSProperties['objectPosition'];
};

const FALLBACK_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1536, 1920] as const;
const FALLBACK_QUALITY = 80;

function tryImageConfig(): ImageConfig | undefined {
  try {
    return getConfig().image;
  } catch {
    return undefined;
  }
}

function passthroughLoader({ src }: DunetaImageLoaderParams) {
  return src;
}

/** Loader for the built-in image optimization route (`IMAGE_OPTIMIZATION_PATH`). */
export function createDunetaImageLoader(): DunetaImageLoader {
  return ({ src, width, quality }) => {
    const image = tryImageConfig();
    const params = new URLSearchParams({ url: src });
    if (width) params.set('w', String(width));
    params.set('q', String(quality ?? image?.quality ?? FALLBACK_QUALITY));
    return `${IMAGE_OPTIMIZATION_PATH}?${params}`;
  };
}

function resolveLoader(loader?: DunetaImageLoader): DunetaImageLoader {
  return loader ?? createDunetaImageLoader();
}

function createSrcSet({
  loader,
  quality,
  src,
  widths,
}: {
  loader: DunetaImageLoader;
  quality?: number;
  src: string;
  widths: readonly number[];
}) {
  return widths.map((width) => `${loader({ src, width, quality })} ${width}w`).join(', ');
}

export const DunetaImage = forwardRef<HTMLImageElement, DunetaImageProps>(function DunetaImage(
  {
    decoding = 'async',
    fill = false,
    height,
    loader: loaderProp,
    loading,
    objectFit,
    objectPosition,
    priority = false,
    quality: qualityProp,
    sizes,
    src,
    style,
    width,
    widths: widthsProp,
    ...props
  },
  ref,
) {
  const imageConfig = tryImageConfig();
  const loader = resolveLoader(loaderProp);
  const widths = widthsProp ?? imageConfig?.deviceSizes ?? FALLBACK_WIDTHS;
  const quality = qualityProp ?? imageConfig?.quality ?? FALLBACK_QUALITY;
  const resolvedLoading = loading ?? (priority ? 'eager' : 'lazy');
  const resolvedSizes = sizes ?? (fill ? '100vw' : width ? `${width}px` : undefined);
  const imageStyle: CSSProperties = fill
    ? {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit,
        objectPosition,
        ...style,
      }
    : {
        maxWidth: '100%',
        height: height ? undefined : 'auto',
        objectFit,
        objectPosition,
        ...style,
      };

  return (
    <img
      {...props}
      ref={ref}
      src={loader({ src, width, quality })}
      srcSet={resolvedSizes ? createSrcSet({ loader, quality, src, widths }) : undefined}
      sizes={resolvedSizes}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={resolvedLoading}
      decoding={decoding}
      fetchPriority={priority ? 'high' : props.fetchPriority}
      style={imageStyle}
    />
  );
});

// Passthrough loader for rare cases (local blob URLs, data URLs).
export { passthroughLoader as dunetaPassthroughImageLoader };
