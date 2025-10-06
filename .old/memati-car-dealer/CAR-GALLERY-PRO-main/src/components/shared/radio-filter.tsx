"use client";
import { AwaitedPageProps } from "@/config/types";
import { ClassifiedStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import React from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";

interface RadioFilterProps extends AwaitedPageProps {
  items: string[];
}

const RadioFilter = (props: RadioFilterProps) => {
  const { searchParams, items } = props;
  const router = useRouter();
  const status = (searchParams?.status as string) || "all";

  const handleStatus = (status: Lowercase<ClassifiedStatus>) => {
    const currentUrlParams = new URLSearchParams(window.location.search);
    currentUrlParams.set("status", status.toUpperCase());
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
          {item}
        </Label>
      ))}
    </RadioGroup>
  );
};

export default RadioFilter;
