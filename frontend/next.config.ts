import type { NextConfig } from "next";
import path from "path";

// Locate the @swc/helpers package that pnpm resolved
const swcHelpersPath = path.resolve(
  __dirname,
  "node_modules/.pnpm/@swc+helpers@0.5.15/node_modules/@swc/helpers"
);

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    // Fix: Set workspace root to this directory so Turbopack uses short
    // module IDs without the project-level path (which contains spaces).
    root: path.resolve(__dirname),
    // Fix: Turbopack pnpm hoisting generates fingerprinted @swc/helpers aliases
    // like "@swc/helpers-<hash>". Map them back to the actual package location.
    resolveAlias: {
      "@swc/helpers": swcHelpersPath,
    },
  },
};

export default nextConfig;

