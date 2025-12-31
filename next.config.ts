import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import "./src/env";

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Parse environment variable for allowed image domains (comma separated)
// Example: IMAGE_HOST_DOMAINS="**.r2.dev, cdn.example.com"
const imageDomains = process.env.IMAGE_HOST_DOMAINS?.split(",").map(d => d.trim()) || ["**.amazonaws.com"];

const remotePatterns = [
  ...imageDomains.map(hostname => ({ hostname })),
  { hostname: "**.openstreetmap.org" } // Always allow map tiles
];

const nextConfig: NextConfig = {
  /* config options here */
  compress: true,
  images: {
		remotePatterns: remotePatterns,
        qualities: [1, 10, 25, 60, 75, 80, 90],
	},
  experimental: {
    authInterrupts: true,
		reactCompiler: true,
		optimizeServerReact: true,
		optimizePackageImports: ["lucide-react", "date-fns"],
  },
  async headers(){
    return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Permissions-Policy",
						value: `camera=(), microphone=(), geolocation=(), midi=(), sync-xhr=(), fullscreen=(self "${process.env.NEXT_PUBLIC_APP_URL}"), geolocation=("${process.env.NEXT_PUBLIC_APP_URL}")`,
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
				],
			},
		];
  }
};

export default withNextIntl(nextConfig);