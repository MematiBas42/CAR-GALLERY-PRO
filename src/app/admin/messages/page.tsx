import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import React from "react";
import { MessageActions } from "@/components/admin/messages/message-actions";

const AdminMessagesPage = async () => {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-200">Contact Messages</h1>
        <div className="text-sm text-slate-400 font-medium bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
            {messages.filter(m => !m.isRead).length} unread
        </div>
      </div>

      <div className="grid gap-4">
        {messages.length === 0 ? (
          <div className="p-12 text-center bg-gray-800 rounded-lg border border-gray-700 text-slate-500 italic">
            No messages found.
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`p-6 rounded-lg border bg-gray-800 shadow-sm transition-all ${msg.isRead ? 'border-gray-700 opacity-75' : 'border-blue-500/50 bg-gray-800/50'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{msg.name}</h3>
                  <p className="text-sm text-slate-400">{msg.email} • {msg.phone || "No phone"}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                    <span className="text-xs text-slate-500 block font-mono">
                        {format(new Date(msg.createdAt), "PPP p")}
                    </span>
                    <MessageActions id={msg.id} isRead={msg.isRead} />
                </div>
              </div>
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminMessagesPage;
