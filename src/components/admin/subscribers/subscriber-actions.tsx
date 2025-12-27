"use client";

import { deleteCustomerAction } from "@/app/_actions/customer";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";

export const SubscriberActions = ({ id }: { id: number }) => {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to remove this subscriber?")) return;
    startTransition(async () => {
      const res = await deleteCustomerAction(id);
      if (res.success) toast.success("Subscriber removed successfully");
      else toast.error("Failed to remove subscriber");
    });
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 hover:bg-red-500/20 text-red-500 rounded-full transition-colors group"
      title="Unsubscribe user"
    >
      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
    </button>
  );
};