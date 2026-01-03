"use client";

import { routes } from "@/config/routes";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import { useClassifiedCount } from "@/hooks/use-taxonomy";
import { useLoading } from "@/hooks/use-loading";

export const SearchButton = ({ initialCount, label = "Search", size = "default", className, currentFilters }: { initialCount: number, label?: string, size?: "default" | "sm" | "lg" | "icon", className?: string, currentFilters?: Record<string, any> }) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Track the search string locally to react to shallow updates instantly
    const [currentSearch, setCurrentSearch] = React.useState("");

    React.useEffect(() => {
        if (!currentFilters) {
            setCurrentSearch(window.location.search);
            const handleLocationChange = () => setCurrentSearch(window.location.search);
            window.addEventListener('popstate', handleLocationChange);
            window.addEventListener('pushstate', handleLocationChange);
            window.addEventListener('replacestate', handleLocationChange);
            const interval = setInterval(handleLocationChange, 100);
            return () => {
                window.removeEventListener('popstate', handleLocationChange);
                window.removeEventListener('pushstate', handleLocationChange);
                window.removeEventListener('replacestate', handleLocationChange);
                clearInterval(interval);
            };
        }
    }, [currentFilters]);

    const queryString = useMemo(() => {
        if (currentFilters) {
            const params = new URLSearchParams();
            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    params.set(key, String(value));
                }
            });
            return params.toString();
        }
        const params = new URLSearchParams(currentSearch);
        params.delete("page");
        return params.toString();
    }, [currentSearch, currentFilters]);

    const isGlobalLoading = useLoading();
    const { count, slug, isLoading: isCountLoading } = useClassifiedCount(queryString, initialCount);

    const isInteractionPending = isGlobalLoading || isCountLoading;

    const handleNavigate = (e: React.MouseEvent) => {
        e.preventDefault();
        
        const targetUrl = count === 1 && slug 
            ? routes.singleClassified(slug)
            : `${routes.inventory}?${queryString}`;
            
        router.push(targetUrl);
    };

	return (
		<Button 
            className={className}
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