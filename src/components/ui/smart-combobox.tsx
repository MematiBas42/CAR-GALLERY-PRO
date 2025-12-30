"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react"

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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState, useMemo } from "react"
import { SimpleImageUploader } from "@/components/ui/simple-image-uploader"
import { toast } from "sonner"
import { 
    createMakeAction, createModelAction, createVariantAction,
    deleteMakeAction, deleteModelAction, deleteVariantAction 
} from "@/app/_actions/taxonomy"

interface SmartComboboxProps {
  options: { label: string; value: string }[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  emptyText?: string
  enableCreate?: boolean
  enableDelete?: boolean
  onCreateSuccess?: (newValue: string) => void
  entityType?: "make" | "model" | "variant"
  parentId?: number | string 
}

export function SmartCombobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  emptyText = "No option found.",
  enableCreate = false,
  enableDelete = false,
  onCreateSuccess,
  entityType = "make",
  parentId
}: SmartComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  
  const [newName, setNewName] = useState("")
  const [newImage, setNewImage] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  
  const [createdOptions, setCreatedOptions] = useState<{ label: string; value: string }[]>([])

  const mergedOptions = useMemo(() => {
      const normalize = (opts: any[]) => (Array.isArray(opts) ? opts : []).map(o => ({ ...o, value: String(o.value) }));
      const normalizedOptions = normalize(options);
      const normalizedCreated = normalize(createdOptions);
      const allOptions = [...normalizedOptions, ...normalizedCreated];
      
      const uniqueOptions = allOptions.filter((obj, index, self) =>
        index === self.findIndex((t) => (
            t.value === obj.value
        ))
      );
      return uniqueOptions;
  }, [options, createdOptions])


  const filteredOptions = mergedOptions.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  )

  const handleCreate = async () => {
      if (!newName) {
          toast.error("Please provide a name.")
          return
      }

      if (entityType === "make" && !newImage) {
           toast.error("Please provide an image for the make.")
           return
      }

      if ((entityType === "model" || entityType === "variant") && !parentId) {
          toast.error(`Parent ID for ${entityType} is missing.`)
          return
      }

      setIsCreating(true)
      
      let res;
      let targetId: string | undefined;
      let targetName: string | undefined;
      let isAlreadyExists = false;

      if (entityType === "make") {
          res = await createMakeAction({ name: newName, image: newImage })
          if (res.make) { targetId = String(res.make.id); targetName = res.make.name; if(!res.success) isAlreadyExists = true; }
      } else if (entityType === "model") {
          res = await createModelAction({ name: newName, makeId: Number(parentId) })
           if (res.model) { targetId = String(res.model.id); targetName = res.model.name; if(!res.success) isAlreadyExists = true; }
      } else if (entityType === "variant") {
          res = await createVariantAction({ name: newName, modelId: Number(parentId) })
           if (res.variant) { targetId = String(res.variant.id); targetName = res.variant.name; if(!res.success) isAlreadyExists = true; }
      }

      setIsCreating(false)

      if (targetId && targetName) {
          if (isAlreadyExists) toast.info(`Selected existing ${entityType}: ${targetName}`);
          else toast.success(`${entityType} created successfully`);
          
          const newOption = { label: targetName, value: targetId }
          setCreatedOptions(prev => [...prev, newOption])
          
          setDialogOpen(false)
          setNewName("")
          setNewImage("")
          setSearchValue("") 
          
          if(onCreateSuccess) onCreateSuccess(targetId)
          setTimeout(() => { onChange(targetId!); setOpen(false) }, 50);
      } else {
          toast.error(res?.message || "Failed to process")
      }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      
      if (!confirm("Are you sure you want to delete this item? It might be linked to cars.")) return;

      let res;
      if (entityType === "make") res = await deleteMakeAction(Number(id));
      else if (entityType === "model") res = await deleteModelAction(Number(id));
      else if (entityType === "variant") res = await deleteVariantAction(Number(id));

      if (res?.success) {
          toast.success(res.message);
          // Remove from local list
          setCreatedOptions(prev => prev.filter(o => o.value !== id));
          // If selected, clear selection
          if (value === id) onChange("");
          // Note: Parent options won't update until refresh unless we force it, but visual feedback is immediate
      } else {
          toast.error(res?.message || "Failed to delete");
      }
  }

  const openCreateDialog = () => {
       setNewName(searchValue)
       setDialogOpen(true)
  }

  const selectedLabel = useMemo(() => {
      return mergedOptions.find((option) => String(option.value) === String(value))?.label;
  }, [mergedOptions, value]);

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent text-white border-input hover:bg-transparent hover:!text-white"
        >
          {value
            ? selectedLabel
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 border-input bg-[#1e293b]">
        <Command shouldFilter={false} className="bg-[#1e293b]"> 
          <CommandInput 
            placeholder={`Search...`} 
            value={searchValue}
            onValueChange={setSearchValue}
            className="text-white border-none focus:ring-0"
          />
          <CommandList className="bg-[#1e293b]">
            {filteredOptions.length === 0 && (
                <CommandEmpty className="py-2 px-2 text-sm text-gray-400">
                    {emptyText}
                    {enableCreate && searchValue && (
                         <Button 
                         variant="ghost" 
                         className="mt-2 w-full justify-start font-normal text-gray-400 hover:text-white hover:bg-slate-800"
                         onClick={openCreateDialog}
                         >
                             <Plus className="mr-2 h-4 w-4" />
                             Create &quot;{searchValue}&quot;
                         </Button>
                    )}
                </CommandEmpty>
            )}
            <CommandGroup className="bg-[#1e293b]">
              {filteredOptions.map((option) => (
                <CommandItem
                  key={String(option.value)}
                  value={option.label}
                  className={cn(
                      "cursor-pointer pointer-events-auto flex justify-between items-center group transition-all duration-200",
                      // Completely remove hover/focus background changes
                      "hover:!bg-transparent aria-selected:!bg-transparent",
                      // Selected State - Professional Glow
                      String(value) === String(option.value) && "bg-gray-100/10 text-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  )}
                  onSelect={() => {
                    onChange(String(option.value))
                    setSearchValue("") 
                    setOpen(false)
                  }}
                  onMouseDown={(e) => {
                    if ((e.target as HTMLElement).closest('.delete-btn')) return;
                    
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(String(option.value))
                    setSearchValue("") 
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center">
                    <Check
                        className={cn(
                        "mr-2 h-4 w-4",
                        String(value) === String(option.value) ? "opacity-100" : "opacity-0"
                        )}
                    />
                    <span className="text-white">{option.label}</span>
                  </div>
                  
                  {enableDelete && (
                      <button 
                        className="delete-btn opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-sm transition-all"
                        onMouseDown={(e) => handleDelete(String(option.value), e)}
                      >
                          <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New {entityType}</DialogTitle>
                <DialogDescription>
                    Add a new {entityType} to the database.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Name</Label>
                    <Input 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder={`e.g. New ${entityType}`}
                    />
                </div>
                 {entityType === "make" && (
                     <div className="space-y-2">
                        <Label>Logo</Label>
                         <SimpleImageUploader 
                            value={newImage}
                            onChange={setNewImage}
                         />
                    </div>
                 )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  )
}
