"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { LatestArrivalSwitch } from "@/components/admin/cars/latest-arrival-switch";
import { formatPrice, getImageUrl } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { reorderLatestArrivalsAction } from "@/app/_actions/car";
import { toast } from "sonner";

// Sortable Item Component
const SortableRow = ({ car }: { car: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: car.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: "relative" as const,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors group ${
        isDragging ? "bg-gray-700/50 opacity-80" : ""
      }`}
    >
      <td className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-20 rounded shadow-md overflow-hidden bg-gray-900 border border-gray-700 min-w-[5rem]">
            {car.images[0] ? (
              <Image
                src={getImageUrl(car.images[0].src)}
                alt={car.title || ""}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-[10px] text-gray-600 italic">
                No image
              </div>
            )}
          </div>
          <div>
            <div className="text-slate-200 font-medium group-hover:text-white transition-colors line-clamp-1 max-w-[150px] sm:max-w-none">
              {car.title}
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              {car.vrm}
            </div>
          </div>
        </div>
      </td>
      <td className="p-4 text-slate-300 font-mono hidden sm:table-cell">
        {formatPrice({ price: car.price })}
      </td>
      <td className="p-4 text-center">
        <div className="flex justify-center">
          <LatestArrivalSwitch
            id={car.id}
            initialValue={car.isLatestArrival}
          />
        </div>
      </td>
      <td className="p-4 text-right touch-none">
        <button
          {...attributes}
          {...listeners}
          className="p-2 hover:bg-gray-600 rounded cursor-grab active:cursor-grabbing text-slate-400 hover:text-white transition-colors"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
};

export const LatestArrivalsList = ({ initialCars }: { initialCars: any[] }) => {
  const [items, setItems] = useState(initialCars);

  useEffect(() => {
      setItems(initialCars);
  }, [initialCars]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Optimistic update
        // Call server action to save order
        const orderData = newItems.map((item, index) => ({
            id: item.id,
            order: index
        }));
        
        reorderLatestArrivalsAction(orderData).then((res) => {
            if (!res.success) {
                toast.error("Failed to reorder items");
            } else {
                toast.success("Order updated");
            }
        });

        return newItems;
      });
    }
  };

  if (items.length === 0) {
    return (
        <div className="p-12 text-center text-slate-500 italic bg-gray-800 rounded-lg border border-gray-700">
            No live vehicles found. Add some cars first!
        </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-900/50 text-slate-300 border-b border-gray-700 text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold">Vehicle</th>
                            <th className="p-4 font-semibold hidden sm:table-cell">Price</th>
                            <th className="p-4 font-semibold text-center">Status</th>
                            <th className="p-4 font-semibold text-right w-16">Sort</th>
                        </tr>
                    </thead>
                    <tbody>
                        <SortableContext
                            items={items.map((item) => item.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {items.map((car) => (
                                <SortableRow key={car.id} car={car} />
                            ))}
                        </SortableContext>
                    </tbody>
                </table>
            </DndContext>
        </div>
    </div>
  );
};
