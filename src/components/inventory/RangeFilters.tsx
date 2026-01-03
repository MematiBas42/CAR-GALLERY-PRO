import type { TaxonomyFiltersProps } from "@/config/types";
import { formatNumber, formatPrice } from "@/lib/utils";
import type { CurrencyCode } from "@prisma/client";
import { useEffect, useState, useRef } from "react";
import { RangeInput } from "../ui/RangeInput";

interface RangeFilterProps extends TaxonomyFiltersProps {
	label: string;
	minName: string;
	maxName: string;
	defaultMin: number;
	defaultMax: number;
	increment?: number;
	thousandSeparator?: boolean;
	currency?: {
		currencyCode: CurrencyCode;
	};
	placeholder?: string;
    applyOnBlur?: boolean;
}

export const RangeFilter = (props: RangeFilterProps) => {
	const {
		label,
		minName,
		maxName,
		thousandSeparator,
		currency,
		handleChange,
		searchParams,
        applyOnBlur,
	} = props;

	const [minVal, setMinVal] = useState(searchParams?.[minName]?.toString() || "");
	const [maxVal, setMaxVal] = useState(searchParams?.[maxName]?.toString() || "");
    const [focusedField, setFocusedField] = useState<"min" | "max" | null>(null);
    const prevSearchParams = useRef(searchParams);

	useEffect(() => {
        if (!searchParams) return;
        
        // Only update if searchParams actually changed to avoid stale overwrites on focus change
        // We compare the specific values we care about
        const prevMin = prevSearchParams.current?.[minName]?.toString() || "";
        const currentMin = searchParams[minName]?.toString() || "";
        const prevMax = prevSearchParams.current?.[maxName]?.toString() || "";
        const currentMax = searchParams[maxName]?.toString() || "";

        if (prevMin !== currentMin || prevMax !== currentMax) {
             if (focusedField !== "min") setMinVal(currentMin);
             if (focusedField !== "max") setMaxVal(currentMax);
        }
        
        prevSearchParams.current = searchParams;
	}, [searchParams, minName, maxName, focusedField]);

	const handleApply = () => {
		let finalMin = minVal;
		let finalMax = maxVal;

		// Auto-swap if Min > Max for logical consistency
		if (minVal && maxVal && Number(minVal) > Number(maxVal)) {
			finalMin = maxVal;
			finalMax = minVal;
			setMinVal(finalMin);
			setMaxVal(finalMax);
		}

		// Perform batch update to trigger only ONE server-side count/refresh
		handleChange({
			[minName]: finalMin && finalMin !== "" ? finalMin : null,
			[maxName]: finalMax && finalMax !== "" ? finalMax : null,
		} as any);
	};

	return (
		<RangeInput
			label={label}
			minInput={{
				name: minName,
				value: minVal,
				onChange: (e) => setMinVal(e.target.value),
				placeholder: "Min",
			}}
			maxInput={{
				name: maxName,
				value: maxVal,
				onChange: (e) => setMaxVal(e.target.value),
				placeholder: "Max",
			}}
			onApply={handleApply}
            applyOnBlur={applyOnBlur}
            onFocusChange={setFocusedField}
		/>
	);
};