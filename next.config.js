/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Only run ESLint on these directories during production builds
    dirs: ['src/app', 'src/components']
  }
}

module.exports = nextConfig 