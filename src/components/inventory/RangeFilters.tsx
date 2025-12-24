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
		let iterator = defaultMin - (increment ?? 1);

		do {
			if (increment) {
				iterator = iterator + increment;
			} else {
				iterator++;
			}


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
		} while (iterator < defaultMax);

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