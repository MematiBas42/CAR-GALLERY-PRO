"use client";

import type { FilterOptions } from "@/config/types";
import type { SelectHTMLAttributes } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface SelectType extends SelectHTMLAttributes<HTMLSelectElement> {
	options: FilterOptions<string, number>;
}

interface RangeSelectProps {
	label: string;
	minSelect: SelectType;
	maxSelect: SelectType;
	placeholder?: string;
}

export const RangeSelect = (props: RangeSelectProps) => {
	const t = useTranslations("Filters");
	const { label, minSelect, maxSelect, placeholder } = props;

	const selectStyles = "h-11 flex-1 w-full pl-3 pr-8 py-2 border border-muted-foreground/20 rounded-md bg-background/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-1 focus:ring-ring hover:border-primary/50 transition-colors appearance-none custom-select";

	return (
		<div className="grid gap-2">
			{label && <h4 className="text-sm font-medium">{label}</h4>}
			<div className="flex gap-2">
				<div className="relative flex-1">
					<select
						{...minSelect}
						className={cn(selectStyles)}
					>
						<option value="">{placeholder || t("min")}</option>
						{minSelect.options.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
				<div className="relative flex-1">
					<select
						{...maxSelect}
						className={cn(selectStyles)}
					>
						<option value="">{placeholder || t("max")}</option>
						{maxSelect.options.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	);
};
