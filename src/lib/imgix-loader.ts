import type { ImageLoaderProps } from "next/image";

interface LoaderProps extends ImageLoaderProps {
	height?: number;
}

export const imgixLoader = ({ src, width, height, quality }: LoaderProps) => {
	const params = new URLSearchParams();
	params.set("w", width.toString());
	params.set("auto", "format,compress");
	if (height) params.set("h", height.toString());
	if (quality) params.set("q", quality.toString());

	const baseUrl = process.env.NEXT_PUBLIC_IMGIX_URL;

	// Case 1: Custom Imgix Domain is configured
	if (baseUrl) {
		const path = src.startsWith("http") ? new URL(src).pathname : src;
		return `${baseUrl}${path}?${params.toString()}`;
	}

	// Case 2: Source is already a full URL (e.g., S3, R2, external)
	if (src.startsWith("http")) {
		const url = new URL(src);
		// Merge existing params with new ones
		params.forEach((value, key) => {
			url.searchParams.set(key, value);
		});
		return url.toString();
	}

	// Case 3: Relative path (local) - fallback to standard Next.js behavior implicitly
	// or just return with params for local server handling
	return `${src}?${params.toString()}`;
};
