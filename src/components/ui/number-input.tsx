import { cn } from "@/lib/utils";
import { type ElementType, forwardRef } from "react";
import { NumericFormat, type NumericFormatProps } from "react-number-format";

export const NumberInput = forwardRef<
	ElementType<typeof NumericFormat>,
	NumericFormatProps
>(({ className, ...props }, ref) => {
	return (
		<NumericFormat
			getInputRef={ref}
			thousandSeparator=","
			thousandsGroupStyle="thousand"
			decimalScale={0}
			allowNegative={false}
			className={cn(
				"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-white transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
});