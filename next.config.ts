import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // @ts-expect-error: allowedDevOrigins is suggested by Next.js CLI but might be missing from types
  allowedDevOrigins: ['100.64.0.1'],
};

export default nextConfig;
