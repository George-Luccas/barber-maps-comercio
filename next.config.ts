/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Adicione isso para evitar que ele tente gerar páginas de erro como estáticas
  distDir: 'out',
  // Enable static export only for Capacitor builds
  ...(process.env.CAPACITOR_BUILD === 'true' ? { output: 'export' } : {}), 
};

export default nextConfig;