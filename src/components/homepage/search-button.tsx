"use client";

import { routes } from "@/config/routes";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import useSWR from "swr";
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const SearchButton = ({ initialCount, label = "Search" }: { initialCount: number, label?: string }) => {
    const searchParams = useSearchParams();
    
    // Convert searchParams to a stable string key for SWR
    const queryString = useMemo(() => {
        const params = new URLSearchParams(searchParams.toString());
        // Remove page if exists as it doesn't affect total count
        params.delete("page");
        return params.toString();
    }, [searchParams]);

	const { data, isLoading } = useSWR(`/api/classifieds/count?${queryString}`, fetcher, {
		fallbackData: queryString ? undefined : { count: initialCount },
		revalidateOnFocus: false,
		dedupingInterval: 1000
	});

	const relativeUrl = `${routes.inventory}?${queryString}`;
    const displayCount = data?.count ?? initialCount;

	return (
		<Button className="w-full relative overflow-hidden h-12 text-base font-semibold" asChild>
			<Link href={queryString ? relativeUrl : routes.inventory}>
				{label} 
                <span className="ml-2 inline-flex items-center min-w-[1.5rem] justify-center bg-white/20 px-2 py-0.5 rounded-full text-sm">
                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : displayCount}
                </span>
			</Link>
		</Button>
	);
};
