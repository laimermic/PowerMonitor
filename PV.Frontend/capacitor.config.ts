import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pv.frontend',
  appName: 'PVMonitor',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    BackgroundRunner: {
      label: 'pv.frontend.background.task',
      src: 'runners/runner.js',
      event: 'testSave',
      repeat: true,
      interval: 4,
      autoStart: true,
    },
    LocalNotifications: {
    }
  }
};

export default config;
