/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude Supabase Edge Functions from Next.js build
  // These are Deno-based functions that run separately on Supabase
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

process.env.NEXT_FONT_GOOGLE_DISABLE_DOWNLOAD ??= "1";

export default nextConfig;
