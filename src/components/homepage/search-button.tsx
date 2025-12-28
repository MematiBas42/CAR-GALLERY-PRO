"use client";

import { routes } from "@/config/routes";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import { useClassifiedCount } from "@/hooks/use-taxonomy";

export const SearchButton = ({ initialCount, label = "Search" }: { initialCount: number, label?: string }) => {
    const searchParams = useSearchParams();
    
    const queryString = useMemo(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page");
        return params.toString();
    }, [searchParams]);

    const { count, isLoading } = useClassifiedCount(queryString, initialCount);

	const relativeUrl = `${routes.inventory}?${queryString}`;

	return (
		<Button className="w-full relative overflow-hidden h-12 text-base font-semibold" asChild>
			<Link href={queryString ? relativeUrl : routes.inventory}>
				{label} 
                <span className="ml-2 inline-flex items-center min-w-[1.5rem] justify-center bg-white/20 px-2 py-0.5 rounded-full text-sm">
                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : count}
                </span>
			</Link>
		</Button>
	);
};