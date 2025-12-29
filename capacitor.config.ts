import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.barbermaps.app',
  appName: 'barber-maps-comercio',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // IMPORTANTE: Substitua pela URL do seu deploy na Vercel quando estiver pronto
    // url: 'https://barber-maps-comercio.vercel.app',
    // cleartext: true
  },
};

export default config;
