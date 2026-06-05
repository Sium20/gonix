/** @type {import('next').NextConfig} */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Supabase Storage (avatars, ID cards). Auto-detected from NEXT_PUBLIC_SUPABASE_URL
      // at build time. Falls back to a wildcard in dev for convenience.
      ...(supabaseHost
        ? [{ protocol: "https", hostname: supabaseHost }]
        : [{ protocol: "https", hostname: "**.supabase.co" }]),
      // Vercel Blob (if you switch STORAGE_BACKEND=vercel-blob later)
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
};
module.exports = nextConfig;
