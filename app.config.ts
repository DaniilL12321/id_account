import { ExpoConfig, ConfigContext } from 'expo/config';

const OAUTH_URL = process.env.OAUTH_URL;
const API_URL = process.env.API_URL;
const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const OAUTH_SCOPE = process.env.OAUTH_SCOPE;
const BUILD_DATE = process.env.BUILD_DATE;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ЯГТУ ID',
  slug: 'ystu-id',
  version: '0.0.1',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'ru.ystu.id',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'ru.ystu.id',
  },
  extra: {
    OAUTH_URL,
    API_URL,
    OAUTH_CLIENT_ID,
    OAUTH_SCOPE,
    BUILD_DATE,
    eas: {
      projectId: '2c23029f-1ccc-4c9a-aaa8-3ef8c7c83d32',
    },
  },
});
