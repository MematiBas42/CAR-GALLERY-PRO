"use client";

import { routes } from "@/config/routes";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import { useClassifiedCount } from "@/hooks/use-taxonomy";
import { useLoading } from "@/hooks/use-loading";

export const SearchButton = ({ initialCount, label = "Search", size = "default" }: { initialCount: number, label?: string, size?: "default" | "sm" | "lg" | "icon" }) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Track the search string locally to react to shallow updates instantly
    const [currentSearch, setCurrentSearch] = React.useState(typeof window !== 'undefined' ? window.location.search : "");

    React.useEffect(() => {
        const handleLocationChange = () => {
            setCurrentSearch(window.location.search);
        };

        window.addEventListener('popstate', handleLocationChange);
        window.addEventListener('pushstate', handleLocationChange);
        window.addEventListener('replacestate', handleLocationChange);

        // Periodically check as a fallback for internal router changes
        const interval = setInterval(handleLocationChange, 100);

        return () => {
            window.removeEventListener('popstate', handleLocationChange);
            window.removeEventListener('pushstate', handleLocationChange);
            window.removeEventListener('replacestate', handleLocationChange);
            clearInterval(interval);
        };
    }, []);

    const queryString = useMemo(() => {
        const params = new URLSearchParams(currentSearch);
        params.delete("page");
        return params.toString();
    }, [currentSearch]);

    const isGlobalLoading = useLoading();
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
            className="w-full relative overflow-hidden font-semibold transition-all h-auto"
            onClick={handleNavigate}
            disabled={isInteractionPending}
            size={size}
        >
			{label} 
            <span className="ml-2 inline-flex items-center min-w-[1.5rem] justify-center bg-gray-500/20 px-2 py-0.5 rounded-full text-sm">
                {isCountLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : count}
            </span>
		</Button>
	);
};