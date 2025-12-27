"use client";

import { toggleLatestArrivalAction } from "@/app/_actions/car";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const LatestArrivalSwitch = ({ id, initialValue }: { id: number; initialValue: boolean }) => {
  const [isLatest, setIsLatest] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const newValue = !isLatest;
    startTransition(async () => {
      const res = await toggleLatestArrivalAction(id, newValue);
      if (res.success) {
        setIsLatest(newValue);
        toast.success(newValue ? "Vehicle added to Latest Arrivals" : "Vehicle removed from Latest Arrivals");
      } else {
        toast.error(res.message || "Failed to update status");
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isLatest ? "bg-blue-600" : "bg-gray-700"
      } ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isLatest ? "translate-x-6" : "translate-x-1"
        }`}
      />
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-3 w-3 animate-spin text-blue-200" />
        </div>
      )}
    </button>
  );
};
