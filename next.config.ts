/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },

  // Enable static export configs only for Capacitor builds
  // ...(process.env.CAPACITOR_BUILD === 'true' ? { 
  //   output: 'export',
  //   distDir: 'out',
  // } : {}), 
};

export default nextConfig;