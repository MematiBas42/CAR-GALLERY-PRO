"use client";

import { routes } from "@/config/routes";
import Link from "next/link";
import { parseAsString, useQueryStates } from "nuqs";
import { Button } from "../ui/button";
import useSWR from "swr";
import { Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const SearchButton = ({ initialCount, label = "Search" }: { initialCount: number, label?: string }) => {
	const [query] = useQueryStates({
		make: parseAsString.withDefault(""),
		model: parseAsString.withDefault(""),
		modelVariant: parseAsString.withDefault(""),
		minYear: parseAsString.withDefault(""),
		maxYear: parseAsString.withDefault(""),
		minPrice: parseAsString.withDefault(""),
		maxPrice: parseAsString.withDefault(""),
	});

	// Construct API URL based on current query states
	const params = new URLSearchParams();
	Object.entries(query).forEach(([key, value]) => {
		if (value) params.set(key, value);
	});

	const { data, isLoading } = useSWR(`/api/classifieds/count?${params.toString()}`, fetcher, {
		fallbackData: { count: initialCount },
		revalidateOnFocus: false,
		dedupingInterval: 2000 // 2 saniye içinde aynı sorguyu yapma
	});

	const relativeUrl = `${routes.inventory}?${params.toString()}`;
    const displayCount = data?.count ?? initialCount;

	return (
		<Button className="w-full relative overflow-hidden" asChild disabled={isLoading}>
			<Link href={relativeUrl}>
				{label} 
                <span className="ml-2 inline-flex items-center min-w-[1.5rem] justify-center">
                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : `(${displayCount})`}
                </span>
			</Link>
		</Button>
	);
};