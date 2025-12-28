"use client";

import type { InputHTMLAttributes } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Button } from "./button";
import { Check } from "lucide-react";

interface InputType extends InputHTMLAttributes<HTMLInputElement> {}

interface RangeInputProps {
	label: string;
	minInput: InputType;
	maxInput: InputType;
	onApply: () => void;
}

export const RangeInput = (props: RangeInputProps) => {
	const t = useTranslations("Filters");
	const { label, minInput, maxInput, onApply } = props;

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			onApply();
		}
	};

	return (
		<div className="grid gap-2">
			{label && <h4 className="text-sm font-medium">{label}</h4>}
			<div className="flex gap-2 items-center">
				<div className="flex-1">
					<Input
						{...minInput}
						type="number"
						onKeyDown={handleKeyDown}
						className="h-10 bg-background/50 border-muted-foreground/20 focus-visible:ring-1"
					/>
				</div>
				<div className="flex-1">
					<Input
						{...maxInput}
						type="number"
						onKeyDown={handleKeyDown}
						className="h-10 bg-background/50 border-muted-foreground/20 focus-visible:ring-1"
					/>
				</div>
				<Button 
                    variant="secondary" 
                    size="icon" 
                    onClick={onApply}
                    className="h-10 w-10 shrink-0 bg-primary/10 hover:bg-primary hover:text-white transition-colors border-none"
                    title={t("apply") || "Apply"}
                >
					<Check className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
};
