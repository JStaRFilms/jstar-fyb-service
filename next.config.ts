import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force Webpack for production builds (Turbopack has issues with micromark/react-markdown)
  // In package.json, the build command uses turbopack by default, but this config
  // ensures proper module resolution for micromark packages
  webpack: (config) => {
    return config;
  },
  // Silence Turbopack error in Next.js 16 when webpack config is present
  turbopack: {},
  // Transpile micromark packages to resolve ESM issues with react-markdown
  transpilePackages: [
    'react-markdown',
    'micromark',
    'micromark-util-decode-numeric-character-reference',
    'micromark-util-decode-string',
    'micromark-util-symbol',
    'micromark-util-character',
    'micromark-util-encode',
    'micromark-core-commonmark',
  ],
};

export default nextConfig;
