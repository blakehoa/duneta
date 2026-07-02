import { DUNETA_THEME_MODES_DEFAULT, type DunetaWebConfig } from './types';

export function createDefaultConfig(): DunetaWebConfig {
  return {
    app: {
      name: 'duneta-web',
      env: 'development',
    },
    api: {
      baseUrl: '/api',
    },
    router: {
      appDirectory: 'app/.router-runtime',
      buildDirectory: 'app/build',
      ssr: {
        streamTimeout: 5_000,
      },
    },
    theme: {
      available: [...DUNETA_THEME_MODES_DEFAULT],
      default: 'light',
    },
    locale: {
      default: 'vi',
      supported: ['vi', 'en'],
    },
    image: {
      deviceSizes: [640, 768, 1024, 1280, 1536, 1920],
      imageSizes: [32, 64, 96, 128, 256, 384],
      quality: 80,
    },
  };
}
