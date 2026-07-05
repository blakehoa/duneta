export const DUNETA_THEME_MODES_DEFAULT = ['light', 'dark', 'system'] as const;

export type DunetaThemeModeDefault =
  (typeof DUNETA_THEME_MODES_DEFAULT)[number];

export type DunetaThemeConfig<
  TModes extends readonly string[] = typeof DUNETA_THEME_MODES_DEFAULT,
> = {
  available: TModes;
  default: TModes[number];
};

/** Web image display — `DunetaImage` srcset widths and default quality. */
export type ImageConfig = {
  deviceSizes: number[];
  imageSizes: number[];
  quality: number;
};

export type LocaleConfig = {
  default: string;
  supported: string[];
};

export type DunetaWebConfig = {
  app: {
    name: string;
    env: 'development' | 'production' | 'test';
  };
  api: {
    baseUrl: string;
  };
  router: {
    appDirectory: string;
    buildDirectory: string;
  };
  theme: DunetaThemeConfig;
  locale: LocaleConfig;
  image: ImageConfig;
};

export type DunetaThemeMode = DunetaWebConfig['theme']['default'];
