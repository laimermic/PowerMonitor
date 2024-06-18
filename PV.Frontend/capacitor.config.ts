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
    // BackgroundRunner: {
    //   label: 'pv.frontend.background.task',
    //   src: 'runners/runner.js',
    //   event: 'testNotification',
    //   repeat: true,
    //   interval: 20,
    //   autoStart: true,
    // },
    // LocalNotifications: {
    // }
  }
};

export default config;
