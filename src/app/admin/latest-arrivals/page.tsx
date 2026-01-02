import { prisma } from "@/lib/prisma";
import React from "react";
import { ClassifiedStatus } from "@prisma/client";
import { LatestArrivalsList } from "@/components/admin/cars/latest-arrivals-list";

const AdminLatestArrivalsPage = async () => {
  const cars = await prisma.classified.findMany({
    where: { status: ClassifiedStatus.LIVE },
    orderBy: [
        { latestArrivalOrder: "asc" },
        { createdAt: "desc" }
    ],
    include: { 
        images: { take: 1 },
        make: true,
        model: true
    },
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-200">Manage Latest Arrivals</h1>
            <p className="text-sm text-slate-400">Drag and drop to reorder. Toggle &quot;Featured Status&quot; to show/hide on homepage.</p>
        </div>
        <div className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/30 text-sm w-full md:w-auto text-center md:text-left">
            Total LIVE vehicles: <strong>{cars.length}</strong>
        </div>
      </div>

      <LatestArrivalsList initialCars={cars} />
    </div>
  );
};

export default AdminLatestArrivalsPage;