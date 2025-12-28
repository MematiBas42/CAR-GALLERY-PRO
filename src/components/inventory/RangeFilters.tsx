import type { FilterOptions, TaxonomyFiltersProps } from "@/config/types";
import { formatNumber, formatPrice } from "@/lib/utils";
import type { CurrencyCode } from "@prisma/client";
import { useEffect, useState, useMemo } from "react";
import { RangeSelect } from "../ui/RangeSelect";

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
}

export const RangeFilter = (props: RangeFilterProps) => {
	const {
		label,
		minName,
		maxName,
		defaultMin,
		defaultMax,
		increment,
		thousandSeparator,
		currency,
		handleChange,
		searchParams,
		placeholder,
	} = props;

	const initialState = useMemo(() => {
		const state: FilterOptions<string, number> = [];
        
        // Ensure values are numbers and handle edge cases
        const min = Math.max(0, defaultMin);
        const max = Math.max(min, defaultMax);
		const range = max - min;
        
        if (range === 0 && min > 0) {
            state.push({ 
                label: currency ? formatPrice({ price: min, currency: currency.currencyCode }) : (thousandSeparator ? formatNumber(min) : min.toString()), 
                value: min 
            });
            return state;
        }
		
		// Dynamic increment calculation if not provided
		let safeIncrement = increment;
		if (!safeIncrement || safeIncrement <= 0) {
			if (range > 500000) safeIncrement = 50000;
			else if (range > 100000) safeIncrement = 10000;
			else if (range > 10000) safeIncrement = 1000;
			else if (range > 1000) safeIncrement = 100;
			else safeIncrement = 1;
		}

		let iterator = min;
		const maxItems = 500; // Reduced for even better performance
		let count = 0;

		while (iterator <= max && count < maxItems) {
			const label = currency 
                ? formatPrice({ price: iterator, currency: currency.currencyCode }) 
                : (thousandSeparator ? formatNumber(iterator) : iterator.toString());
            
            state.push({ label, value: iterator });
			
			iterator += safeIncrement;
			count++;
		}

		return state;
	}, [defaultMin, defaultMax, increment, currency, thousandSeparator]);

	const [minOptions, setMinOptions] =
		useState<FilterOptions<string, number>>(initialState);
	const [maxOptions, setMaxOptions] = useState<FilterOptions<string, number>>(
		initialState.toReversed(),
	);

	useEffect(() => {
		let currentMinOptions = initialState;
		let currentMaxOptions = [...initialState].reverse();

		if (searchParams?.[minName]) {
			currentMaxOptions = initialState.filter(
				({ value }) => value > Number(searchParams[minName]),
			).reverse();
		}
		if (searchParams?.[maxName]) {
			currentMinOptions = initialState.filter(
				({ value }) => value < Number(searchParams[maxName]),
			);
		}

		setMinOptions(currentMinOptions);
		setMaxOptions(currentMaxOptions);
	}, [searchParams?.[minName], searchParams?.[maxName], initialState, minName, maxName]);

	return (
		<RangeSelect
			label={label}
			placeholder={placeholder}
			minSelect={{
				name: minName,
				value: Number(searchParams?.[minName]) || "",
				onChange: handleChange,
				options: minOptions,
			}}
			maxSelect={{
				name: maxName,
				value: Number(searchParams?.[maxName]) || "",
				onChange: handleChange,
				options: maxOptions,
			}}
		/>
	);
};