import type { FilterOptions } from "@/config/types";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import type { NumericFormatProps } from "react-number-format";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { NumberInput } from "./number-input";


interface InputSelectProps extends NumericFormatProps {
	inputName: string;
	selectName: string;
	label?: string;
	options: FilterOptions<string, string>;
	prefix?: string;
}
const InputSelect = (props: InputSelectProps) => {
  const { inputName, selectName, label, options, prefix, ...numberInputProps } =
		props;

	const form = useFormContext();
    return (
    <div className="w-full relative">
      <FormField
				control={form.control}
				name={inputName}
				render={({ field: { onChange, ...rest } }) => (
					<FormItem>
						{label && <FormLabel htmlFor={inputName}>{label}</FormLabel>}
						<FormControl>
							<NumberInput
								onValueChange={(values) => {
									onChange(values.floatValue);
								}}
								{...rest}
								{...numberInputProps}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name={selectName}
				render={({ field: { ref, ...rest } }) => (
					<FormItem>
						<FormControl>
							<div className="absolute right-0 -translate-y-10 h-10 flex items-center pr-2 border-l border-l-border">
								<select
									className={cn(
										"custom-select appearance-none pr-10 bg-no-repeat disabled:bg-muted/50 border rounded-md focus:outline-hidden focus:ring-0 focus-visible:ring-0 pl-3 text-muted-foreground border-transparent",
									)}
									{...rest}
								>
									{options.map((option) => (
										<option key={option.value} value={option.label}>
											{option.label}
										</option>
									))}
								</select>
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
    </div>
  )
}

export default InputSelect
