/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Adicione isso para evitar que ele tente gerar páginas de erro como estáticas
  distDir: 'out', 
};

export default nextConfig;