/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // allow Google images short links + your Supabase storage host
    remotePatterns: [
      { protocol: "https", hostname: "images.app.goo.gl" },
      { protocol: "https", hostname: "*.supabase.co" }, // covers your storage CDN
    ],
  },
};

module.exports = nextConfig;
