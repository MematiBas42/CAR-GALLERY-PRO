import { prisma } from "@/lib/prisma";
import { CustomerStatus } from "@prisma/client";
import { format } from "date-fns";
import React from "react";
import { SubscriberActions } from "@/components/admin/subscribers/subscriber-actions";
import { BulkEmailForm } from "@/components/admin/subscribers/bulk-email-form";

const AdminSubscribersPage = async () => {
  const subscribers = await prisma.customer.findMany({
    where: { status: CustomerStatus.SUBSCRIBER },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-200">Newsletter Subscribers</h1>
            <p className="text-sm text-slate-400">View and manage users who subscribed to your newsletter.</p>
        </div>
        <div className="flex gap-3">
            <BulkEmailForm />
            <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm flex items-center">
            {subscribers.length} Subscribers
            </span>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-900/50 text-slate-300 border-b border-gray-700 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Email Address</th>
                <th className="p-4 font-semibold">Full Name</th>
                <th className="p-4 font-semibold">Subscription Date</th>
                <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                {subscribers.length === 0 ? (
                <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-500 italic">
                    No active subscribers found.
                    </td>
                </tr>
                ) : (
                subscribers.map((sub) => (
                    <tr key={sub.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors group">
                    <td className="p-4 text-slate-200 font-medium font-mono">{sub.email}</td>
                    <td className="p-4 text-slate-400">
                        {sub.firstName} {sub.lastName}
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                        {format(new Date(sub.createdAt), "PPP")}
                    </td>
                    <td className="p-4 text-right">
                        <SubscriberActions id={sub.id} />
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscribersPage;