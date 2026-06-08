import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // This project has its own lockfile; pin the tracing root to silence the
  // "multiple lockfiles" workspace-root warning.
  outputFileTracingRoot: path.join(process.cwd()),
  sassOptions: {
    // Modern Dart-Sass API uses loadPaths; lets modules do `@use "tokens"`.
    loadPaths: [path.join(process.cwd(), "src/styles")],
    includePaths: [path.join(process.cwd(), "src/styles")],
  },
};

export default nextConfig;
