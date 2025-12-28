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
		const range = defaultMax - defaultMin;
		
		// Sensible default increment to prevent millions of items
		let safeIncrement = increment;
		if (!safeIncrement) {
			if (range > 100000) safeIncrement = 10000;
			else if (range > 10000) safeIncrement = 1000;
			else if (range > 1000) safeIncrement = 100;
			else safeIncrement = 1;
		}

		let iterator = defaultMin;
		
		// Safety: max 1000 items
		const maxItems = 1000;
		let count = 0;

		while (iterator <= defaultMax && count < maxItems) {
			if (currency) {
				state.push({
					label: formatPrice({
						price: iterator,
						currency: currency.currencyCode,
					}),
					value: iterator,
				});
			} else if (thousandSeparator) {
				state.push({ label: formatNumber(iterator), value: iterator });
			} else {
				state.push({ label: iterator.toString(), value: iterator });
			}
			
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