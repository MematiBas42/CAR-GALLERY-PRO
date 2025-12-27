"use client";
import { AwaitedPageProps } from "@/config/types";
import { useRouter } from "next/navigation";
import React from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface RadioFilterProps extends AwaitedPageProps {
  items: string[];
  enumType?: "ClassifiedStatus" | "CustomerStatus"; // Add enumType prop
}

const RadioFilter = (props: RadioFilterProps) => {
  const t = useTranslations("Enums");
  const { searchParams, items, enumType = "ClassifiedStatus" } = props; // Default to ClassifiedStatus
  const router = useRouter();
  const status = (searchParams?.status as string) || "all";

  const handleStatus = (val: string) => {
    const currentUrlParams = new URLSearchParams(window.location.search);
    currentUrlParams.set("status", val.toUpperCase());
    const url = new URL(window.location.href);
    url.search = currentUrlParams.toString();
    router.push(url.toString());
  };

  return (
    <RadioGroup
      defaultValue="all"
      value={status}
      onValueChange={handleStatus}
      className="flex items-center gap-4"
    >
      {items.map((item) => (
        <Label
          htmlFor={item.toLowerCase()}
          className={cn(
            "flex-1 rounded-md px-4 py-2 text-center text-muted text-sm font-medium transition-colors hover:bg-sky-800 cursor-pointer",
            status?.toLowerCase() === item.toLowerCase() &&
              "text-white bg-sky-500"
          )}
          key={item}
        >
          <RadioGroupItem
            id={item.toLowerCase()}
            value={item.toLowerCase()}
            checked={status?.toLowerCase() === item.toLowerCase()}
            className="peer sr-only"
          />
          {t(`${enumType}.${item}`)}
        </Label>
      ))}
    </RadioGroup>
  );
};

export default RadioFilter;