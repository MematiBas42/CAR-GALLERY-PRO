import { prisma } from "@/lib/prisma";
import { CustomerStatus } from "@prisma/client";
import { format } from "date-fns";
import React from "react";
import { SubscriberActions } from "@/components/admin/subscribers/subscriber-actions";

const AdminSubscribersPage = async () => {
  const subscribers = await prisma.customer.findMany({
    where: { status: CustomerStatus.SUBSCRIBER },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-200">Newsletter Subscribers</h1>
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
          {subscribers.length} Total
        </span>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900/50 text-slate-300 border-b border-gray-700">
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Joined Date</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500 italic">
                  No subscribers found.
                </td>
              </tr>
            ) : (
              subscribers.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors group">
                  <td className="p-4 text-slate-200 font-medium">{sub.email}</td>
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
  );
};

export default AdminSubscribersPage;