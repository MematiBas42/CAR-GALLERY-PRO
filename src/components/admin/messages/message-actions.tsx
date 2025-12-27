"use client";

import { markMessageAsReadAction, deleteMessageAction } from "@/app/_actions/messages";
import { Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";

export const MessageActions = ({ id, isRead }: { id: number; isRead: boolean }) => {
  const [isPending, startTransition] = useTransition();

  const handleMarkAsRead = () => {
    startTransition(async () => {
      const res = await markMessageAsReadAction(id);
      if (res.success) toast.success("Message marked as read");
      else toast.error(res.error);
    });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this message? This action cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteMessageAction(id);
      if (res.success) toast.success("Message deleted successfully");
      else toast.error(res.error);
    });
  };

  return (
    <div className="flex gap-2">
      {!isRead && (
        <button 
          onClick={handleMarkAsRead}
          disabled={isPending}
          className="p-2 hover:bg-green-500/20 text-green-500 rounded-full transition-colors group"
          title="Mark as read"
        >
          <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      )}
      <button 
        onClick={handleDelete}
        disabled={isPending}
        className="p-2 hover:bg-red-500/20 text-red-500 rounded-full transition-colors group"
        title="Delete message"
      >
        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};