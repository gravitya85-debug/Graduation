import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kfs.tarbianaweia.alumni',
  appName: 'خريجى نوعية كفر الشيخ',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 0,
      showSpinner: false
    }
  }
};

export default config;
