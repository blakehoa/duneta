import {
  Suspense,
  lazy,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from 'react';

type DynamicModule<TProps> = {
  default: ComponentType<TProps>;
};

export type DunetaDynamicLoader<TProps> = () => Promise<DynamicModule<TProps>>;

export type DunetaDynamicOptions = {
  fallback?: ReactNode;
  loading?: ComponentType | ReactNode;
  ssr?: boolean;
  onError?: (error: unknown) => void;
};

function renderFallback(loading?: ComponentType | ReactNode, fallback?: ReactNode) {
  if (!loading) return fallback ?? null;
  if (typeof loading === 'function') {
    const Loading = loading as ComponentType;
    return <Loading />;
  }
  return loading;
}

function ClientOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  return mounted ? <>{children}</> : <>{fallback ?? null}</>;
}

export function createDynamicComponent<TProps extends object>(
  loader: DunetaDynamicLoader<TProps>,
  options: DunetaDynamicOptions = {},
): ComponentType<TProps> & { preload: () => Promise<DynamicModule<TProps>> } {
  let preloadPromise: Promise<DynamicModule<TProps>> | undefined;

  const load = async () => {
    try {
      preloadPromise ??= loader();
      return await preloadPromise;
    } catch (error) {
      options.onError?.(error);
      throw error;
    }
  };

  const LazyComponent = lazy(load);

  function DynamicComponent(props: TProps) {
    const fallback = renderFallback(options.loading, options.fallback);
    const content = (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );

    return options.ssr === false ? <ClientOnly fallback={fallback}>{content}</ClientOnly> : content;
  }

  return Object.assign(DynamicComponent, { preload: load });
}
