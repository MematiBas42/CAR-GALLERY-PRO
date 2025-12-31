"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxProps {
  options: { label: string; value: string }[]
  value?: string
  onChange: (e: { target: { name: string; value: string } }) => void
  name: string
  label?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

export function Combobox({
  options = [],
  value = "",
  onChange,
  name,
  label,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const lastLabelRef = React.useRef<string>("")
  
  // Optimistic local state for instant feedback
  const [localValue, setLocalValue] = React.useState(value)

  // Sync local state with external value prop
  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleSelect = (val: string) => {
    setOpen(false)
    setLocalValue(val) // Instant visual update
    onChange({ target: { name, value: val } })
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLocalValue("") // Instant visual clear
    onChange({ target: { name, value: "" } })
  }

  // Update and persist the label whenever options or localValue changes
  const displayLabel = React.useMemo(() => {
    if (!localValue) {
        lastLabelRef.current = ""
        return placeholder
    }
    const found = options.find((opt) => String(opt.value) === String(localValue))
    if (found) {
        lastLabelRef.current = found.label
        return found.label
    }
    return lastLabelRef.current || (isNaN(Number(localValue)) ? localValue : placeholder)
  }, [localValue, options, placeholder])

  return (
    <div className={cn("grid gap-1", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between pr-2 h-9 border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors bg-background/50 backdrop-blur-sm shadow-sm"
            disabled={disabled}
          >
            <span className="truncate font-normal text-muted-foreground">
              {displayLabel}
            </span>
            <div className="flex items-center gap-1">
                {localValue && (
                    <div 
                        onClick={handleClear}
                        className="rounded-full p-1 hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors"
                    >
                        <X className="h-3.5 w-3.5 opacity-70" />
                    </div>
                )}
                <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-40" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[--radix-popover-trigger-width] p-0 shadow-2xl border-primary/10" 
          align="start"
        >
          <Command className="max-h-[300px]">
            <CommandInput placeholder={searchPlaceholder} className="h-10 text-sm border-none focus:ring-0" />
            <CommandList className="max-h-[250px] overflow-y-auto">
              <CommandEmpty className="py-4 text-sm text-muted-foreground text-center">{emptyText}</CommandEmpty>
              <CommandGroup className="p-1">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                    className={cn(
                        "rounded-md px-3 py-2 text-sm cursor-pointer transition-all duration-200",
                        // Selected State - Permanent Professional Glow
                        String(value) === String(option.value) && "bg-gray-100 text-black font-bold shadow-[0_0_15px_rgba(0,0,0,0.05)]"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-black",
                        String(value) === String(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}