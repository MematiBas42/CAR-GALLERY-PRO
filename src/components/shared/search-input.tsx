"use client";
import { useQueryState } from "nuqs";
import React, { ChangeEvent, useCallback, useRef } from "react";
import debounce from "debounce";
import { set } from "zod";
import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { setIsLoading } from "@/hooks/use-loading";
interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

function debounceFunc<T extends (...args: any) => any>(
  func: T,
  wait: number,
  opts: {
    immediate: boolean;
  }
) {
  return debounce(func, wait, opts);
}

const SearchInput = (props: SearchInputProps) => {
  const { className, ...rest } = props;
  const [isPending, startTransition] = React.useTransition();
  const [q, setSearch] = useQueryState("q", { 
      shallow: false,
      startTransition 
  });
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setIsLoading(isPending, "search-input-update");
    return () => setIsLoading(false, "search-input-update");
  }, [isPending]);

  

  const handleSearch = useCallback(
    debounceFunc(
      (value: string) => {
        setSearch(value || null);
      },
      1000,
      { immediate: false }
    ),
    [] // Add dependency array
  );

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newvalue = e.target.value;
    handleSearch(newvalue);
  };

  const clearSearch = () => {
    setSearch(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }
  return (
    <form action="" className="relative flex-1 min-w-0">
      <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        defaultValue={q || ""}
        className={cn(className, "pl-8 pr-8 w-full h-10 md:h-11")}
        onChange={onChange}
        type="text"
        {...rest}
      />
      {q && (
        <XIcon
         className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground bg-muted
         p-0.5 rounded-full cursor-pointer hover:bg-muted-foreground/20 transition-colors"
            onClick={clearSearch}
        />
      )}
    </form>
  );
};

export default SearchInput;
