"use client";

import { routes } from "@/config/routes";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import { useClassifiedCount } from "@/hooks/use-taxonomy";
import { useLoading } from "@/hooks/use-loading";

export const SearchButton = ({ initialCount, label = "Search" }: { initialCount: number, label?: string }) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isGlobalLoading = useLoading();
    
    const queryString = useMemo(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page");
        return params.toString();
    }, [searchParams]);

    const { count, slug, isLoading: isCountLoading } = useClassifiedCount(queryString, initialCount);

    const isInteractionPending = isGlobalLoading || isCountLoading;

    const handleNavigate = (e: React.MouseEvent) => {
        e.preventDefault();
        
        // 1. Get the LATEST query string directly from window to avoid closure staleness
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.delete("page");
        const currentQuery = currentParams.toString();

        // 2. Navigate based on the LATEST known state
        const targetUrl = count === 1 && slug 
            ? routes.singleClassified(slug)
            : `${routes.inventory}?${currentQuery}`;
            
        router.push(targetUrl);
    };

	return (
		<Button 
            className="w-full relative overflow-hidden h-12 text-base font-semibold transition-all"
            onClick={handleNavigate}
            disabled={isInteractionPending}
        >
			{label} 
            <span className="ml-2 inline-flex items-center min-w-[1.5rem] justify-center bg-gray-500/20 px-2 py-0.5 rounded-full text-sm">
                {isCountLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : count}
            </span>
		</Button>
	);
};