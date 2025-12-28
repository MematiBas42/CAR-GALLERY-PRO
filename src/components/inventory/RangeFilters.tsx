import type { TaxonomyFiltersProps } from "@/config/types";
import { formatNumber, formatPrice } from "@/lib/utils";
import type { CurrencyCode } from "@prisma/client";
import { useEffect, useState } from "react";
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
	} = props;

	const [minVal, setMinVal] = useState(searchParams?.[minName]?.toString() || "");
	const [maxVal, setMaxVal] = useState(searchParams?.[maxName]?.toString() || "");

	useEffect(() => {
		setMinVal(searchParams?.[minName]?.toString() || "");
		setMaxVal(searchParams?.[maxName]?.toString() || "");
	}, [searchParams?.[minName], searchParams?.[maxName], minName, maxName]);

	const handleApply = () => {
		handleChange({ target: { name: minName, value: minVal } } as any);
		handleChange({ target: { name: maxName, value: maxVal } } as any);
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
		/>
	);
};