"use client";
import { UpdateCarType } from "@/app/schemas/car.schema";
import React, { useCallback, useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { v4 as uuidv4 } from "uuid";
import { generateThumbHashFromFile } from "@/lib/thumbhash-client";
import { createPngDataUri } from "unlazy/thumbhash";
import { cn } from "@/lib/utils";
import DragAndDrop from "./drag-and-drop";
import dynamic from "next/dynamic";
import { SortableItem } from "./SortableItem";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";


const DragAndDropContext = dynamic(
	() => import("./drag-and-grop-context").then((mod) => mod.DragAndDropContext),
	{
		ssr: false,
		loading: () => (
			<div className="gap-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<Skeleton key={i} className="aspect-3/2 rounded-md w-full" />
				))}
			</div>
		),
	},
);


export type CarImages = UpdateCarType["images"];
interface MultiImageUploaderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  className?: string;
  value?: CarImages;
  onChange?: (value: CarImages) => void;
  maxFiles?: number;
}

type ImageProgess = {
  uuid: string;
  progress: number;
};

const MultiImageUploader = (props: MultiImageUploaderProps) => {
  const { className, value, maxFiles, ...rest } = props;
  const form = useFormContext<UpdateCarType>();
  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "images",
    keyName: "uuid", // Use 'uuid' as the key name for each image
  });
  const [items, setItems] = useState<CarImages>(fields);
  const [progress, setProgress] = useState<ImageProgess[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (value) {
      setItems(value);
    }
  }, [value]);

  const handleItemProgress = useCallback((updates: ImageProgess) => {
    setProgress((prev) => {
      const index = prev.findIndex((item) => item.uuid === updates.uuid);
      if (index === -1) {
        return [...prev, updates];
      }
      const newProgess = [...prev];
      newProgess[index] = { ...newProgess[index], ...updates };
      return newProgess;
    });
  }, []);

  const handleItemUpdate = useCallback(
    (newItems: CarImages) => {
      replace(newItems);
      setItems(newItems);
    },
    [replace]
  );
  
  const setFiles = useCallback(
    async (validfiles: File[]) => {
      const files = Object.values(validfiles);
      setIsUploading(true);
      
      const currentItems = [...items];
      const newItems: CarImages = [];

      // Create placeholders first
      for (const file of files) {
        const uuid = uuidv4();
        const hash = await generateThumbHashFromFile(file);
        const base64 = createPngDataUri(hash);
        
        const placeholder = {
          id: currentItems.length + newItems.length + 1, // temporary id
          uuid,
          src: base64, // initially show blurhash or blob url
          alt: file.name,
          base64,
          done: false,
        };
        
        newItems.push(placeholder);
        
        // Initial progress 0
        handleItemProgress({ uuid, progress: 0 });
      }
      
      // Update UI with placeholders
      const allItems = [...currentItems, ...newItems];
      setItems(allItems);
      
      // Process uploads sequentially or in parallel
      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const item = newItems[i];
          
          try {
              const formData = new FormData();
              formData.append("file", file);
              
              // Simulating progress since fetch doesn't support it natively easily
              handleItemProgress({ uuid: item.uuid!, progress: 50 });

              const response = await fetch("/api/images/single-upload", {
                  method: "POST",
                  body: formData,
              });

              if (!response.ok) {
                  throw new Error("Upload failed");
              }

              const data = await response.json();
              
              if (data.url) {
                  // Update item with real URL
                  item.src = data.url;
                  item.done = true;
                  handleItemProgress({ uuid: item.uuid!, progress: 100 });
              } else {
                  throw new Error("No URL returned");
              }

          } catch (error) {
              console.error("Upload error for file:", file.name, error);
              toast.error(`Failed to upload ${file.name}`);
              // Remove failed item
              const index = allItems.findIndex(x => x.uuid === item.uuid);
              if (index > -1) allItems.splice(index, 1);
          }
      }
      
      setItems([...allItems]);
      replace(allItems);
      setIsUploading(false);
    },
    [items, handleItemProgress, replace]
  );

  const remove = (i: number) => {
    setItems((prev) => prev.filter((item) => item.id !== i));
    replace(items.filter((item) => item.id !== i));
  };
  return (
    <div className={cn( className, `space-y-3 mt-1`)}>
      <DragAndDrop
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        items={items}
        setFiles={setFiles}
      />
      <div className="relative overflow-hidden rounded-lg">
        {/* grag and grop context */}
        <DragAndDropContext 
        replace={handleItemUpdate}
        items={items}
        renderItem={(item) => (
          <SortableItem 
            key={item.uuid}
            index={item.id as number}
            item={item}
            remove={remove}
            progress={
              progress.find((p) => p.uuid === item.uuid)?.progress as number
            }
          />
        )}
          />
      </div>
    </div>
  );
};

export default MultiImageUploader;