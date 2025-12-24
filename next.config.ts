import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost:3000", "192.168.1.7:3000", "192.168.1.5:3000", "192.168.1.5"],
  /* config options here */
  compress: true,
  images: {
		remotePatterns: [{ hostname: "*" }],
        qualities: [25, 50, 75, 100],
	},
  experimental: {
    authInterrupts: true,
		reactCompiler: true,
		optimizeCss: true,
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