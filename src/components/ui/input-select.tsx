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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";


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
    <FormField
      control={form.control}
      name={inputName}
      render={({ field: { onChange, ...rest } }) => (
        <FormItem className="grid gap-2">
          {label && <FormLabel htmlFor={inputName}>{label}</FormLabel>}
          <FormControl>
            <div className="flex items-center rounded-md border border-input focus-within:ring-1 focus-within:ring-ring h-9 bg-transparent overflow-hidden">
              <NumberInput
                className="flex-grow border-none focus-visible:ring-0 text-white min-w-0 h-full py-0"
                onValueChange={(values) => {
                  onChange(values.floatValue);
                }}
                {...rest}
                {...numberInputProps}
              />
              <div className="border-l border-l-input h-full">
                <FormField
                  control={form.control}
                  name={selectName}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="border-none focus:ring-0 h-full bg-transparent rounded-none px-4 min-w-[100px]">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default InputSelect
