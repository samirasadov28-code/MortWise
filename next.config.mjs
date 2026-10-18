import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Next/Image optimization. The site has a small set of internal
  // assets only (logos under /public + recently-imported flag PNGs); leaving
  // optimization on means resized/avif variants are served per device.
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default withBundleAnalyzer(nextConfig);
