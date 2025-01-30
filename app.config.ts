import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ЯГТУ ID',
  slug: 'ystu-id',
  version: '1.0.1',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'ru.ystuty.id'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'ru.ystuty.id'
  },
  extra: {
    OAUTH_URL: process.env.OAUTH_URL,
    API_URL: process.env.API_URL,
    OAUTH_CLIENT_ID: process.env.OAUTH_CLIENT_ID,
    OAUTH_SCOPE: process.env.OAUTH_SCOPE,
    eas: {
        projectId: "2c23029f-1ccc-4c9a-aaa8-3ef8c7c83d32"
      }
  },
}); 