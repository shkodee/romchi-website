/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  // только для превью-сборки (PREVIEW=1): ассеты под /a/_next
  ...(process.env.PREVIEW ? { assetPrefix: '/a' } : {}),
};
export default nextConfig;
